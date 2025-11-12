"use client";

import * as React from "react";
import TextareaAutosize from "react-textarea-autosize";
import * as Select from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";

import { chatModels } from "@/lib/validation";
import type { ChatModelId } from "@/lib/validation";

type InputComposerProps = {
  isSending?: boolean;
  selectedModel?: ChatModelId;
  onModelChange?: (model: ChatModelId) => void;
};

const DEFAULT_MODEL_ID = chatModels[0]?.id ?? "gpt-4o";
const MIN_TEXTAREA_ROWS = 2;
const MAX_TEXTAREA_ROWS = 6;

export function InputComposer({
  isSending = false,
  selectedModel = DEFAULT_MODEL_ID,
  onModelChange,
}: InputComposerProps) {
  const [message, setMessage] = React.useState("");
  const messageErrorId = undefined;
  const formRef = React.useRef<HTMLFormElement>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Let the parent form handle submission via the form's onSubmit handler
  };

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Submit on Enter (without Shift), allow Shift+Enter for new line
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (!isSending && formRef.current) {
          formRef.current.requestSubmit();
        }
      }
    },
    [isSending],
  );

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/95 p-4 shadow-soft-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
        <fieldset className="flex-1 space-y-2" disabled={isSending}>
          <label
            htmlFor="message-prompt"
            className="text-sm font-medium text-foreground"
          >
            Message prompt
          </label>
          <TextareaAutosize
            name="message"
            id="message-prompt"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-30 w-full resize-none rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            minRows={MIN_TEXTAREA_ROWS}
            maxRows={MAX_TEXTAREA_ROWS}
            placeholder="Type your message..."
            disabled={isSending}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span aria-live="polite" aria-atomic="true">
              {message.length}/4000
            </span>
          </div>
        </fieldset>

        <div className="flex w-full flex-col gap-3 sm:w-60">
          <fieldset className="space-y-2" disabled={isSending}>
            <legend className="text-sm font-medium text-foreground">
              Model selection
            </legend>
            <Select.Root 
              value={selectedModel} 
              onValueChange={onModelChange}
            >
              <Select.Trigger
                aria-label="Select AI model"
                className="inline-flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 px-4 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=open]:ring-2 data-[state=open]:ring-ring/60"
              >
                <Select.Value />
                <Select.Icon>
                  <ChevronDownIcon aria-hidden className="h-4 w-4" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  className="z-50 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border/60 bg-popover shadow-soft-lg"
                  position="popper"
                  sideOffset={6}
                >
                  <Select.Viewport className="p-1">
                    {chatModels.map((model) => (
                      <Select.Item
                        key={model.id}
                        value={model.id}
                        className="group flex cursor-pointer select-none items-start gap-3 rounded-lg px-3 py-2 text-sm text-foreground outline-none data-[highlighted]:bg-muted/60 data-[state=checked]:bg-muted/40"
                      >
                        <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border border-border/80 group-data-[state=checked]:bg-primary group-data-[state=checked]:text-primary-foreground group-data-[state=checked]:shadow-inner">
                          <CheckIcon
                            aria-hidden
                            className="h-4 w-4 opacity-0 group-data-[state=checked]:opacity-100"
                          />
                        </span>
                        <span className="flex flex-col">
                          <Select.ItemText className="font-medium">
                            {model.label}
                          </Select.ItemText>
                          <span className="text-xs text-muted-foreground">
                            {model.description}
                          </span>
                        </span>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </fieldset>

          <input type="hidden" name="model" value={selectedModel} />
        </div>
      </div>
    </div>
  );
}

