import type { Message } from "@/lib/messages";

import { MessageCard } from "@/components/ai-elements/message";

type MessageListProps = {
  messages: Message[];
};

export function MessageList({ messages }: MessageListProps) {
  return (
    <ol
      className="relative flex h-full flex-col gap-4 overflow-y-auto px-4 py-6 sm:px-6"
      data-testid="message-list"
    >
      {messages.length ? (
        messages.map((message) => <MessageCard key={message.id} message={message} />)
      ) : (
        <li className="flex h-full items-center justify-center">
          <p className="rounded-xl border border-dashed border-border/60 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
            No messages yet. Start the conversation to see responses here.
          </p>
        </li>
      )}
    </ol>
  );
}

