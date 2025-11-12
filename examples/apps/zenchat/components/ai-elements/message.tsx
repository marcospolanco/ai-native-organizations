"use client";

import { forwardRef, type ReactNode } from "react";
import * as Accordion from "@radix-ui/react-accordion";

import type { Message } from "@/lib/messages";
import { cn } from "@/lib/utils";
import { Response } from "@/components/ai-elements/response";

type MessageProps = {
  message: Message;
};

export const MessageCard = forwardRef<HTMLLIElement, MessageProps>(
  ({ message }, ref) => {
    const hasDetails = Boolean(message.reasoning ?? message.sources?.length);
    
    // Layout - user messages on right, assistant messages on left with consistent margins
    const isUser = message.role === "user";
    const alignmentClassName = isUser ? "justify-end pr-4" : "justify-start pl-4";

    return (
      <li
        ref={ref}
        data-testid={`message-item-${message.id}`}
        data-role={message.role}
        className={cn("group flex w-full items-end gap-2 py-4", isUser ? "is-user" : "is-assistant", alignmentClassName)}
      >
        {/* Message Content */}
        <div className={cn(
          "flex flex-col gap-2 rounded-lg text-sm px-4 py-3 overflow-hidden max-w-[80%]",
          isUser 
            ? "text-white bg-gray-700" 
            : "text-foreground bg-secondary"
        )}>
          {/* Sources Toggle for Assistant Messages */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <button className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded hover:bg-accent/80 transition-colors">
                📚 {message.sources.length} sources
              </button>
            </div>
          )}
          
          {/* Main Response */}
          {isUser ? (
            <p>{message.body}</p>
          ) : (
            <Response>{message.body}</Response>
          )}
          
          {/* Reasoning Toggle for Assistant Messages */}
          {!isUser && message.reasoning && (
            <div className="mt-2">
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                🧠 Show reasoning
              </button>
            </div>
          )}
        </div>
      </li>
    );
  },
);

MessageCard.displayName = "MessageCard";

type AccordionItemProps = {
  value: string;
  triggerLabel: string;
  description?: string;
  children?: ReactNode;
};

function AccordionItem({
  value,
  triggerLabel,
  description,
  children,
}: AccordionItemProps) {
  return (
    <Accordion.Item
      value={value}
      className="overflow-hidden rounded-xl border border-border/60 bg-background/95 text-foreground"
    >
      <Accordion.Header>
        <Accordion.Trigger
          className={cn(
            "group flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm font-semibold transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "data-[state=open]:text-foreground data-[state=closed]:text-muted-foreground",
          )}
        >
          <span>{triggerLabel}</span>
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-xs font-semibold text-muted-foreground transition-transform group-data-[state=open]:rotate-45"
          >
            +
          </span>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content
        className={cn(
          "border-t border-border/60 px-4 py-3 text-sm text-muted-foreground",
        )}
      >
        {description ? <p className="mb-2">{description}</p> : null}
        {children}
      </Accordion.Content>
    </Accordion.Item>
  );
}


