"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useStreamableValue, type StreamableValue } from "@ai-sdk/rsc";

import { sendMessageAction, type SendMessageActionResult } from "@/app/actions/send-message";
import type { Message } from "@/lib/messages";
import { useChatStore, type ChatMessageUpdate } from "@/lib/stores/chat-store";
import { ConfigurationError, ValidationError } from "@/lib/errors";
import type { ChatHistoryMessage, MessageComposerInput, ChatModelId } from "@/lib/validation";
import { 
  observability, 
  trackMessageSent, 
  trackStreamingStarted, 
  trackStreamingCompleted, 
  trackStreamingError,
  trackModelSwitch,
  trackConversationReset
} from "@/lib/observability";

type UseChatSessionOptions = {
  initialMessages?: Message[];
};

type SubmitVariables = MessageComposerInput & {
  messages: ChatHistoryMessage[];
};

type UseChatSessionReturn = {
  messages: Message[];
  selectedModel: ChatModelId;
  isStreaming: boolean;
  isSending: boolean;
  error?: string;
  handleSubmit: (input: MessageComposerInput) => Promise<void>;
  setModel: (model: ChatModelId) => void;
  resetConversation: () => void;
};

export function useChatSession(options: UseChatSessionOptions = {}): UseChatSessionReturn {
  const { initialMessages = [] } = options;

  const messages = useChatStore((state) => state.messages);
  const selectedModel = useChatStore((state) => state.selectedModel);
  const setModel = useChatStore((state) => state.setModel);
  
  const handleSetModel = useCallback((newModel: ChatModelId) => {
    if (newModel !== selectedModel) {
      trackModelSwitch(selectedModel, newModel);
      setModel(newModel);
    }
  }, [selectedModel, setModel]);
  const appendMessage = useChatStore((state) => state.appendMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const setStreaming = useChatStore((state) => state.setStreaming);
  const error = useChatStore((state) => state.error);
  const setError = useChatStore((state) => state.setError);
  const resetStore = useChatStore((state) => state.reset);

  const [activeStream, setActiveStream] = useState<StreamableValue<string> | undefined>();
  const [assistantMessageId, setAssistantMessageId] = useState<string | null>(null);
  const hasSeededRef = useRef(false);
  // Track which stream is associated with which assistant message to prevent cross-contamination
  const streamToMessageMapRef = useRef<Map<StreamableValue<string>, string>>(new Map());
  // Manual accumulation ref as a fallback/workaround
  const manualStreamedTextRef = useRef<string>("");

  const [streamedText, streamError, isPendingStream] = useStreamableValue(activeStream);
  
  // Debug: Log what useStreamableValue returns
  useEffect(() => {
    if (activeStream) {
      console.log("useStreamableValue result", {
        hasActiveStream: !!activeStream,
        streamedTextType: typeof streamedText,
        streamedTextValue: streamedText,
        streamedTextLength: typeof streamedText === "string" ? streamedText.length : 0,
        isPendingStream,
        hasError: !!streamError,
        manualAccumulatedLength: manualStreamedTextRef.current.length,
      });
      
      // Manual accumulation as fallback - if useStreamableValue returns a string, accumulate it
      if (typeof streamedText === "string" && streamedText.length > manualStreamedTextRef.current.length) {
        manualStreamedTextRef.current = streamedText;
        console.log("Manual accumulation updated", {
          newLength: streamedText.length,
          preview: streamedText.substring(0, 100),
        });
      }
    } else {
      // Reset manual accumulation when stream is cleared
      manualStreamedTextRef.current = "";
    }
  }, [activeStream, streamedText, isPendingStream, streamError]);

  // Initialize messages only once on mount if initialMessages are provided
  // and store is empty
  useEffect(() => {
    // Only seed once, and only if we haven't seeded yet and initialMessages exist
    if (hasSeededRef.current) {
      return;
    }

    // Check if store is empty by reading messages length
    const currentMessagesLength = useChatStore.getState().messages.length;
    
    if (currentMessagesLength === 0 && initialMessages.length > 0) {
      resetStore(initialMessages);
    }

    hasSeededRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - intentionally empty deps

  useEffect(() => {
    // Debug: Log every time the effect runs
    console.log("useChatSession effect running", {
      hasAssistantMessageId: !!assistantMessageId,
      hasActiveStream: !!activeStream,
      streamedTextType: typeof streamedText,
      streamedTextLength: typeof streamedText === "string" ? streamedText.length : 0,
      isPendingStream,
      streamError: !!streamError,
    });

    // Only process if we have an active stream and assistant message ID
    if (!assistantMessageId || !activeStream) {
      console.log("Effect early return - missing assistantMessageId or activeStream");
      return;
    }

    // CRITICAL: Verify this stream belongs to this assistant message
    // This prevents old stream values from updating new messages
    const expectedMessageId = streamToMessageMapRef.current.get(activeStream);
    // Only block if mapping exists AND points to a different message
    // If mapping doesn't exist, allow it (shouldn't happen, but safety check)
    if (expectedMessageId !== undefined && expectedMessageId !== assistantMessageId) {
      // This stream belongs to a different message, ignore it
      console.warn("Stream belongs to different message, ignoring", {
        currentMessageId: assistantMessageId,
        expectedMessageId,
        streamExists: !!activeStream,
      });
      return;
    }

    // Verify the assistant message exists in the store before updating
    const currentMessages = useChatStore.getState().messages;
    const assistantMessage = currentMessages.find((m) => m.id === assistantMessageId);
    
    // If message doesn't exist, clear state and return
    if (!assistantMessage) {
      streamToMessageMapRef.current.delete(activeStream);
      setStreaming(false);
      setActiveStream(undefined);
      setAssistantMessageId(null);
      return;
    }

    if (streamError) {
      const error = streamError instanceof Error ? streamError : new Error("Streaming failed.");
      const message = error.message;
      
      setError(message);
      updateMessage(assistantMessageId, {
        meta: "Streaming failed",
      });
      streamToMessageMapRef.current.delete(activeStream);
      setStreaming(false);
      setActiveStream(undefined);
      setAssistantMessageId(null);

      // Track streaming error
      trackStreamingError({
        errorType: error.constructor.name,
        errorMessage: message,
      });

      observability.trackError(error, {
        messageId: assistantMessageId,
        eventType: "streaming_error",
      });

      return;
    }

    const update: ChatMessageUpdate = {};

    // Update body with streamed text if we have content
    // We've already verified this stream belongs to this message at the top of the effect
    // streamedText can be undefined initially (when stream starts), empty string (if stream has no content yet), or a string (when content is streaming)
    // IMPORTANT: Always update if we have streamed content, even if it seems the same
    // This ensures we capture all updates, especially during rapid streaming
    const hasStreamedContent = typeof streamedText === "string" && streamedText !== "";
    const contentIsDifferent = hasStreamedContent && streamedText !== assistantMessage.body;
    
    // Debug logging during streaming - log every update to track what's happening
    if (hasStreamedContent) {
      console.log("Streaming update", {
        assistantMessageId,
        streamedTextLength: streamedText.length,
        streamedTextPreview: streamedText.substring(0, 100),
        currentBodyLength: assistantMessage.body?.length || 0,
        contentIsDifferent,
        isPendingStream,
      });
    }
    
    // Always update if we have streamed content
    // This ensures we capture incremental updates even if they seem redundant
    if (hasStreamedContent) {
      update.body = streamedText;
    }

    // Update meta based on stream state
    if (isPendingStream) {
      // Stream is still pending - set meta to "Streaming response"
      if (assistantMessage.meta !== "Streaming response") {
        update.meta = "Streaming response";
      }
    } else {
      // Stream has completed - don't update meta here, will be handled in completion block
      // Only update if we're still in streaming mode (shouldn't happen, but safety check)
    }

    // Apply updates if we have any
    if (Object.keys(update).length > 0) {
      updateMessage(assistantMessageId, update);
    }

    // Handle stream completion
    if (!isPendingStream) {
      // Stream has completed - get latest message state
      const finalMessages = useChatStore.getState().messages;
      const finalAssistantMessage = finalMessages.find((m) => m.id === assistantMessageId);
      
      if (!finalAssistantMessage) {
        // Message doesn't exist, clean up and return
        streamToMessageMapRef.current.delete(activeStream);
        setStreaming(false);
        setActiveStream(undefined);
        setAssistantMessageId(null);
        return;
      }
      
      // Get final content from streamedText and message body
      // IMPORTANT: During streaming, we update message.body with streamedText incrementally
      // So by the time the stream completes, message.body should have the accumulated content
      // However, streamedText might have the final accumulated value too
      // We prioritize message.body since it was updated during streaming and is more reliable
      const streamText = typeof streamedText === "string" ? streamedText : "";
      const messageBody = finalAssistantMessage.body || "";
      
      // Debug logging to understand what's happening
      console.log("Stream completion check", {
        assistantMessageId,
        streamTextType: typeof streamedText,
        streamTextLength: streamText?.length,
        streamTextPreview: streamText?.substring(0, 100),
        messageBodyLength: messageBody?.length,
        messageBodyPreview: messageBody?.substring(0, 100),
        isPendingStream,
      });
      
      // Determine final content - prioritize messageBody since it was updated during streaming
      // If messageBody has content, use it (it's the source of truth from incremental updates)
      // If messageBody is empty but streamText has content, use streamText (fallback)
      const finalContent = messageBody || streamText;
      
      // Save final content to message body
      // If streamText has more content than messageBody, use streamText (shouldn't happen, but safety)
      // Otherwise, just ensure messageBody is set and clear meta
      if (streamText && streamText.trim() !== "" && streamText.length > messageBody.length) {
        // StreamText has more content - use it (shouldn't normally happen)
        updateMessage(assistantMessageId, {
          body: streamText,
          meta: undefined,
        });
      } else if (finalContent && finalContent.trim() !== "") {
        // Final content exists - ensure it's saved and clear meta
        if (finalContent !== messageBody) {
          updateMessage(assistantMessageId, {
            body: finalContent,
            meta: undefined,
          });
        } else {
          // Content already matches, just clear meta
          updateMessage(assistantMessageId, {
            meta: undefined,
          });
        }
      }
      
      // Check if we actually received content
      // Prioritize messageBody since it was updated during streaming
      // Fall back to streamText if messageBody is empty
      const hasContent = (messageBody && messageBody.trim() !== "") || (streamText && streamText.trim() !== "");
      
      if (!hasContent) {
        // Stream completed but no content received
        // Log as warning since this could be a legitimate empty response
        console.warn("Stream completed with no content", {
          assistantMessageId,
          streamTextType: typeof streamedText,
          streamTextLength: streamText?.length,
          messageBodyLength: messageBody?.length,
          isPendingStream,
          streamedTextValue: streamedText,
        });
        setError("No response received from the AI. Please check your API configuration and try again.");
        updateMessage(assistantMessageId, {
          meta: "No response received",
        });
      } else {
        // Success - track completion
        trackStreamingCompleted({
          model: selectedModel,
          messageCount: finalMessages.length,
          conversationLength: finalMessages.filter(m => ["user", "assistant"].includes(m.role)).length,
        });
      }
      
      // Clean up stream mapping and clear state
      streamToMessageMapRef.current.delete(activeStream);
      setStreaming(false);
      setActiveStream(undefined);
      setAssistantMessageId(null);
    }
  }, [
    assistantMessageId,
    activeStream,
    isPendingStream,
    setError,
    setStreaming,
    streamError,
    streamedText,
    updateMessage,
    selectedModel,
  ]);

  const mutation = useMutation<SendMessageActionResult, Error, SubmitVariables>({
    mutationFn: async (variables) => {
      const response = await sendMessageAction(variables);

      if (response.error) {
        throw new Error(response.error);
      }

      return response;
    },
    onError: (mutationError) => {
      const message = mutationError instanceof Error ? mutationError.message : "Request failed.";
      setError(message);
      setStreaming(false);
    },
  });

    const handleSubmit = async (input: MessageComposerInput) => {
      setError(null);
  
      // Get current messages from store FIRST to ensure we have the latest state
      // This must include any completed assistant messages from previous streams
      const currentMessages = useChatStore.getState().messages;
  
      // Build history - include all user and assistant messages with content
      // CRITICAL: This must include the previous assistant response for the LLM to generate a new one
      const history = currentMessages
        .filter((message): message is Message & { role: "user" | "assistant" } =>
          ["user", "assistant"].includes(message.role),
        )
        .filter((message) => {
          // Only include messages with actual content
          // IMPORTANT: If an assistant message has no content, it means streaming hasn't completed
          // In that case, we should wait for it to complete before sending a new message
          const hasContent = message.body.trim().length > 0;
          return hasContent;
        })
        .map((message) => ({
          role: message.role,
          content: message.body.trim(),
        }));
  
      const userMessageId = crypto.randomUUID();
  
      appendMessage({
        id: userMessageId,
        role: "user",
        authorLabel: "You",
        body: input.message,
      });
  
      // Track message sent event
      trackMessageSent({
        model: input.model || selectedModel,
        messageCount: currentMessages.length + 1,
        conversationLength: history.length,
      });
  
      setStreaming(true);
  
      const timer = observability.startPerformanceTimer("message_processing");
  
      try {
        const result = await mutation.mutateAsync({
          ...input,
          model: input.model || selectedModel,
          messages: history,
        });
  
        if (result.stream) {
          const assistantId = crypto.randomUUID();
          
          console.log("Setting up stream", {
            assistantId,
            hasStream: !!result.stream,
            streamType: typeof result.stream,
          });
          
          // CRITICAL: Map this stream to this assistant message BEFORE setting state
          // This ensures the effect knows this stream belongs to this message
          streamToMessageMapRef.current.set(result.stream, assistantId);
          
          // Create the assistant message first
          appendMessage({
            id: assistantId,
            role: "assistant",
            authorLabel: "Zen Chat",
            body: "",
            meta: "Streaming response",
          });
          
          // Set assistant message ID and stream AFTER mapping and message creation
          // Order matters: message exists -> mapping exists -> state set -> effect can process
          setAssistantMessageId(assistantId);
          setActiveStream(result.stream);
          console.log("Stream state set", { assistantId, hasStream: !!result.stream });
          timer(); // Stop timer when stream is set up
  
          // Track streaming started
          trackStreamingStarted({
            model: input.model || selectedModel,
            messageCount: currentMessages.length + 1,
          });
        } else {
          setStreaming(false);
          timer();
        }
      } catch (submissionError) {
        timer();
  
        const error = 
          submissionError instanceof ConfigurationError ||
          submissionError instanceof ValidationError
            ? submissionError
            : submissionError instanceof Error
              ? submissionError
              : new Error("Unable to send message.");
  
        // Track error
        observability.trackError(error, {
          messageId: userMessageId,
          model: input.model || selectedModel,
          messageCount: currentMessages.length + 1,
        });
  
        const message = error.message;
  
        setError(message);
        setStreaming(false);
        updateMessage(userMessageId, {
          meta: "Delivery failed",
        });
      }
    };
  const resetConversation = useCallback(() => {
    const messageCount = messages.length;
    
    resetStore(initialMessages);
    setError(null);
    setStreaming(false);
    setAssistantMessageId(null);
    setActiveStream(undefined);

    // Track conversation reset
    trackConversationReset({
      messageCount,
      conversationLength: messages.filter(m => ["user", "assistant"].includes(m.role)).length,
    });
  }, [messages, initialMessages, resetStore, setError, setStreaming]);

  // isSending should be true when:
  // 1. Mutation is pending (before server action returns)
  // 2. We're actively streaming (isStreaming is true)
  // 3. Stream is pending (isPendingStream is true)
  // But once the stream is set up, mutation.isPending becomes false, so we rely on isStreaming/isPendingStream
  const isSending = useMemo(() => {
    // If we have an active stream, use streaming state
    if (activeStream) {
      return isStreaming || isPendingStream;
    }
    // Otherwise, use mutation pending state
    return mutation.isPending || isStreaming;
  }, [
    activeStream,
    isPendingStream,
    isStreaming,
    mutation.isPending,
  ]);

  const result: UseChatSessionReturn = {
    messages,
    selectedModel,
    setModel: handleSetModel,
    isStreaming,
    isSending,
    handleSubmit,
    resetConversation,
  };

  if (error) {
    result.error = error;
  }

  return result;
}


