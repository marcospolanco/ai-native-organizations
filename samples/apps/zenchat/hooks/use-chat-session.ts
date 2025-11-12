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
  const seededRef = useRef(false);

  const [streamedText, streamError, isPendingStream] = useStreamableValue(activeStream);

  useEffect(() => {
    if (seededRef.current) {
      return;
    }

    if (!messages.length && initialMessages.length) {
      resetStore(initialMessages);
    }

    seededRef.current = true;
  }, [initialMessages, messages.length, resetStore]);

  useEffect(() => {
    if (!assistantMessageId) {
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

    if (streamedText !== undefined) {
      update.body = streamedText;
    }

    if (isPendingStream) {
      update.meta = "Streaming response";
    } else {
      update.meta = undefined;
    }

    if (Object.keys(update).length > 0) {
      updateMessage(assistantMessageId, update);
    }

    if (!isPendingStream) {
      setStreaming(false);
      setActiveStream(undefined);
      setAssistantMessageId(null);

      // Track streaming completion
      if (streamedText !== undefined) {
        trackStreamingCompleted({
          model: selectedModel,
          messageCount: messages.length,
          conversationLength: messages.filter(m => ["user", "assistant"].includes(m.role)).length,
        });
      }
    }
  }, [
    assistantMessageId,
    isPendingStream,
    setError,
    setStreaming,
    streamError,
    streamedText,
    updateMessage,
    selectedModel,
    messages,
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

      const history = messages
        .filter((message): message is Message & { role: "user" | "assistant" } =>
          ["user", "assistant"].includes(message.role),
        )
        .map((message) => ({
          role: message.role,
          content: message.body,
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
        messageCount: messages.length + 1,
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
          setAssistantMessageId(assistantId);
          appendMessage({
            id: assistantId,
            role: "assistant",
            authorLabel: "Zen Chat",
            body: "",
            meta: "Streaming response",
          });
          setActiveStream(result.stream);

          // Track streaming started
          trackStreamingStarted({
            model: input.model || selectedModel,
            messageCount: messages.length + 1,
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
          messageCount: messages.length + 1,
        });

        const message = error.message;

        setError(message);
        setStreaming(false);
        updateMessage(userMessageId, {
          meta: "Delivery failed",
        });
      }
    },
    [appendMessage, messages, mutation, selectedModel, setError, setStreaming, updateMessage],
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

  const isSending = useMemo(() => mutation.isPending || isStreaming || isPendingStream, [
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


