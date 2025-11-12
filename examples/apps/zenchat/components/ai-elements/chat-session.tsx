"use client";

import { InputComposer } from "@/components/ai-elements/input-composer";
import { MessageList } from "@/components/ai-elements/message-list";
import type { Message } from "@/lib/messages";
import { useChat } from "@ai-sdk/react";
import { useChatStore } from "@/lib/stores/chat-store";
import { useCallback, useMemo, useState } from "react";
import { 
  trackMessageSent,
  trackModelSwitch,
  trackConversationReset
} from "@/lib/observability";
import { chatModels } from "@/lib/validation";
import type { ChatModelId } from "@/lib/validation";

type ChatSessionProps = {
  initialMessages?: Message[];
};

export function ChatSession({ initialMessages = [] }: ChatSessionProps) {
  // Store state for persistence
  const selectedModel = useChatStore((state) => state.selectedModel);
  const setModelInStore = useChatStore((state) => state.setModel);
  const resetStore = useChatStore((state) => state.reset);

  // Convert initial messages to AI SDK format
  const initialMessagesForSDK = useMemo(() => 
    initialMessages.map(msg => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      content: msg.body,
      createdAt: new Date()
    })), [initialMessages]
  );

  // Manage input state locally (like ai-elements does)
  const [input, setInput] = useState("");

  // Use AI SDK's useChat hook - handles all streaming complexity
  const { 
    messages: aiMessages, 
    sendMessage, 
    isLoading, 
    error,
    setMessages
  } = useChat({
    initialMessages: initialMessagesForSDK,
  });

  // Convert AI SDK messages back to our Message format
  const messages: Message[] = useMemo(() => 
    aiMessages.map(msg => {
      // Handle different AI SDK message formats
      let body = "";
      
      if (typeof msg.content === "string") {
        body = msg.content;
      } else if (msg.parts && Array.isArray(msg.parts)) {
        // Extract text from parts array
        const textParts = msg.parts.filter((part: any) => part.type === "text");
        body = textParts.map((part: any) => part.text).join("");
      } else {
        body = "";
      }
      
      return {
        id: msg.id,
        role: msg.role as "user" | "assistant",
        authorLabel: msg.role === "user" ? "You" : "Zen Chat",
        body
      };
    }), [aiMessages]
  );

  // Model management
  const handleSetModel = useCallback((newModel: ChatModelId) => {
    if (newModel !== selectedModel) {
      trackModelSwitch(selectedModel, newModel);
      setModelInStore(newModel);
    }
  }, [selectedModel, setModelInStore]);

  // Use the AI SDK's sendMessage for messages
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (input?.trim()) {
      // Track message sent event
      trackMessageSent({
        model: selectedModel,
        messageCount: messages.length + 1,
        conversationLength: messages.length,
      });
      
      // Send message using AI SDK
      sendMessage(
        { text: input },
        {
          body: {
            model: selectedModel,
          },
        }
      );
      
      // Clear input
      setInput("");
    }
  }, [selectedModel, messages, sendMessage, input]);

  // Reset conversation
  const resetConversation = useCallback(() => {
    const messageCount = messages.length;
    
    resetStore(initialMessages);
    setMessages(initialMessagesForSDK);

    // Track conversation reset
    trackConversationReset({
      messageCount,
      conversationLength: messages.filter(m => ["user", "assistant"].includes(m.role)).length,
    });
  }, [messages, initialMessages, resetStore, setMessages, initialMessagesForSDK]);

  const isSending = isLoading;

  return (
    <div className="flex flex-1 flex-col gap-6 rounded-3xl border border-border/60 bg-background/95 p-5 shadow-soft-lg transition-colors sm:p-8 lg:p-10">
      <section
        role="region"
        aria-live="polite"
        className="flex flex-1 flex-col gap-4"
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={resetConversation}
            className="rounded-full border border-border/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Reset
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-muted/20" />
          <MessageList messages={messages} />
        </div>
      </section>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error.message}
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/95 p-4 shadow-soft-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <fieldset className="flex-1 space-y-2" disabled={isSending}>
              <label
                htmlFor="message-prompt"
                className="text-sm font-medium text-foreground"
              >
                Message prompt
              </label>
              <textarea
                id="message-prompt"
                name="message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[120px] w-full resize-none rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                placeholder="Type your message..."
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isSending && input.trim()) {
                      sendMessage(
                        { text: input },
                        {
                          body: {
                            model: selectedModel,
                          },
                        }
                      );
                      setInput("");
                    }
                  }
                }}
              />
            </fieldset>

            <div className="flex w-full flex-col gap-3 sm:w-60">
              <fieldset className="space-y-2" disabled={isSending}>
                <legend className="text-sm font-medium text-foreground">
                  Model selection
                </legend>
                <select
                  value={selectedModel}
                  onChange={(e) => handleSetModel(e.target.value as ChatModelId)}
                  className="inline-flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 px-4 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  {chatModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </fieldset>

              <input type="hidden" name="model" value={selectedModel} />
              
              <button
                type="submit"
                disabled={isSending || !input?.trim()}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-accent text-sm font-semibold text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSending ? "Sending…" : "Send message"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}


