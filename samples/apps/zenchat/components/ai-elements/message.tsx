"use client";

import { forwardRef, type ReactNode } from "react";
import * as Accordion from "@radix-ui/react-accordion";

import type { Message } from "@/lib/messages";
import { cn } from "@/lib/utils";

type MessageProps = {
  message: Message;
};

export const MessageCard = forwardRef<HTMLLIElement, MessageProps>(
  ({ message }, ref) => {
    const hasDetails = Boolean(message.reasoning ?? message.sources?.length);
    const alignmentClassName =
      message.role === "user" ? "justify-end" : "justify-start";
    const surfaceClassName =
      message.role === "user"
        ? "border-transparent bg-accent text-accent-foreground"
        : "border-border/60 bg-background/95 text-foreground";

    return (
      <li
        ref={ref}
        data-testid={`message-item-${message.id}`}
        data-role={message.role}
        className={cn("flex", alignmentClassName)}
      >
        <article
          aria-label={`${message.authorLabel} message`}
          data-has-details={hasDetails ? "true" : "false"}
          className={cn(
            "group relative max-w-full rounded-2xl border px-4 py-3 text-sm shadow-soft-sm transition-colors sm:max-w-[28rem] sm:px-5 sm:py-4 sm:text-base",
            surfaceClassName,
          )}
        >
          <header className="flex flex-col gap-2">
            <p className="text-sm font-semibold tracking-tight sm:text-base">
              {message.authorLabel}
            </p>
            {message.meta ? (
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {message.meta}
              </p>
            ) : null}
          </header>

          <p className="mt-3 text-sm leading-6 sm:text-base">{message.body}</p>

          {hasDetails ? (
            <Accordion.Root
              type="multiple"
              className="mt-4 space-y-2"
              data-testid={`message-details-${message.id}`}
            >
              {message.reasoning ? (
                <AccordionItem
                  value="reasoning"
                  triggerLabel="Reasoning"
                  description={message.reasoning}
                />
              ) : null}

              {message.sources?.length ? (
                <AccordionItem
                  value="sources"
                  triggerLabel="Sources"
                  description="Reference links for this response."
                >
                  <ul className="space-y-1 text-sm text-muted-foreground underline-offset-4">
                    {message.sources.map((source) => (
                      <li key={source.href}>
                        <a
                          href={source.href}
                          className="transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          {source.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </AccordionItem>
              ) : null}
            </Accordion.Root>
          ) : null}
        </article>
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


