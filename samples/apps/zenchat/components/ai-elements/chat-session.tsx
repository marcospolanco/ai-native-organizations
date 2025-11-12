"use client";

import { InputComposer } from "@/components/ai-elements/input-composer";
import { MessageList } from "@/components/ai-elements/message-list";
import type { Message } from "@/lib/messages";
import { previewMessages } from "@/lib/messages";
import { useChatSession } from "@/hooks/use-chat-session";

type ChatSessionProps = {
  initialMessages?: Message[];
};

export function ChatSession({ initialMessages = previewMessages }: ChatSessionProps) {
  const { messages, handleSubmit, isSending, error, resetConversation } = useChatSession({
    initialMessages,
  });

  return (
    <div className="flex flex-1 flex-col gap-6 rounded-3xl border border-border/60 bg-background/95 p-5 shadow-soft-lg transition-colors sm:p-8 lg:p-10">
      <section
        aria-labelledby="conversation-timeline-title"
        role="region"
        aria-live="polite"
        className="flex flex-1 flex-col gap-4"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2
            id="conversation-timeline-title"
            className="text-base font-semibold tracking-tight text-foreground sm:text-lg"
          >
            Conversation timeline
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>Context persists as you switch between AI models.</span>
            <button
              type="button"
              onClick={resetConversation}
              className="rounded-full border border-border/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Reset
            </button>
          </div>
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
          {error}
        </div>
      ) : null}

      <InputComposer onSubmit={handleSubmit} isSending={isSending} />
    </div>
  );
}


