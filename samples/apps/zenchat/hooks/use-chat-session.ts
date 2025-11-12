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

  const [streamedText, streamError, isPendingStream] = useStreamableValue(activeStream);

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
    // Only process if we have an active stream and assistant message ID
    if (!assistantMessageId || !activeStream) {
      return;
    }

    // Verify the assistant message exists in the store before updating
    const currentMessages = useChatStore.getState().messages;
    const assistantMessage = currentMessages.find((m) => m.id === assistantMessageId);
    
    // If message doesn't exist, clear state and return
    if (!assistantMessage) {
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

    // Only update body if we have actual content (not just empty string)
    // Only update if streamedText is different from current body to avoid unnecessary updates
    if (streamedText !== undefined && streamedText !== "" && streamedText !== assistantMessage.body) {
      update.body = streamedText;
    }

    if (isPendingStream) {
      if (assistantMessage.meta !== "Streaming response") {
        update.meta = "Streaming response";
      }
    } else {
      if (assistantMessage.meta !== undefined) {
        update.meta = undefined;
      }
    }

    if (Object.keys(update).length > 0) {
      updateMessage(assistantMessageId, update);
    }

    if (!isPendingStream) {
      // Stream has completed - check if we got content
      // Check the message body in the store as it should have the final accumulated text
      const updatedMessages = useChatStore.getState().messages;
      const updatedAssistantMessage = updatedMessages.find((m) => m.id === assistantMessageId);
      
      // Check if we have content in either streamedText or the message body
      const hasContent = 
        (streamedText !== undefined && streamedText !== "") ||
        (updatedAssistantMessage?.body !== undefined && updatedAssistantMessage.body !== "");
      
      if (!hasContent) {
        // Stream completed but no content received
        setError("No response received from the AI. Please check your API configuration and try again.");
        updateMessage(assistantMessageId, {
          meta: "No response received",
        });
      } else {
        // Ensure the final streamed text is in the message body
        if (streamedText !== undefined && streamedText !== "" && updatedAssistantMessage?.body !== streamedText) {
          updateMessage(assistantMessageId, {
            body: streamedText,
            meta: undefined,
          });
        } else if (updatedAssistantMessage?.meta !== undefined) {
          // Clear meta if content exists
          updateMessage(assistantMessageId, {
            meta: undefined,
          });
        }
        
        // Track successful streaming completion
        const finalMessages = useChatStore.getState().messages;
        trackStreamingCompleted({
          model: selectedModel,
          messageCount: finalMessages.length,
          conversationLength: finalMessages.filter(m => ["user", "assistant"].includes(m.role)).length,
        });
      }
      
      // Clear stream state after processing
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

  const handleSubmit = useCallback(
    async (input: MessageComposerInput) => {
      setError(null);

      // Clear any previous stream state before starting a new message
      setActiveStream(undefined);
      setAssistantMessageId(null);
      setStreaming(false);

      // Get current messages from store to ensure we have the latest state
      const currentMessages = useChatStore.getState().messages;

      const history = currentMessages
        .filter((message): message is Message & { role: "user" | "assistant" } =>
          ["user", "assistant"].includes(message.role),
        )
        .filter((message) => message.body.trim().length > 0) // Only include messages with content
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
          // Set assistant message ID first, then stream
          // This ensures the effect knows which message to update
          setAssistantMessageId(assistantId);
          appendMessage({
            id: assistantId,
            role: "assistant",
            authorLabel: "Zen Chat",
            body: "",
            meta: "Streaming response",
          });
          // Set stream after message is created to ensure proper sequencing
          setActiveStream(result.stream);
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
    },
    [appendMessage, mutation, selectedModel, setError, setStreaming, updateMessage],
  );

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


