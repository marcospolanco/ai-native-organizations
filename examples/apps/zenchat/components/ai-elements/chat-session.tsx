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
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex flex-col h-full min-h-0">
        
        {/* Messages Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <MessageList messages={messages} />
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive mx-4 mb-4 flex-shrink-0"
          >
            {error.message}
          </div>
        ) : null}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="w-full divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm mt-4 flex-shrink-0">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full resize-none rounded-none border-none p-3 shadow-none outline-none ring-0 bg-transparent focus-visible:ring-0 text-foreground placeholder-muted-foreground"
            placeholder="What would you like to know?"
            rows="1"
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
          <div className="flex items-center justify-between p-1">
            <div className="flex items-center gap-1">
              {/* Model Selector */}
              <select
                value={selectedModel}
                onChange={(e) => handleSetModel(e.target.value as ChatModelId)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors font-medium bg-transparent border-none outline-none"
              >
                {chatModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              {/* Stop Button (shown when streaming) */}
              {isSending && (
                <button
                  type="button"
                  className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" strokeWidth="2"></rect>
                  </svg>
                </button>
              )}
              {/* Send Button */}
              <button
                type="submit"
                disabled={isSending || !input?.trim()}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


