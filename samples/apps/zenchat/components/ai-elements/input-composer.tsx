"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import * as Select from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { zodResolver } from "@hookform/resolvers/zod";

import { chatModels, messageComposerSchema } from "@/lib/validation";
import type { MessageComposerInput } from "@/lib/validation";

type InputComposerProps = {
  defaultModelId?: (typeof chatModels)[number]["id"];
  isSending?: boolean;
  onSubmit?: (input: MessageComposerInput) => Promise<void> | void;
};

const DEFAULT_MODEL_ID = chatModels[0]?.id ?? "gpt-4o";
const MIN_TEXTAREA_ROWS = 2;
const MAX_TEXTAREA_ROWS = 6;

export function InputComposer({
  defaultModelId = DEFAULT_MODEL_ID,
  isSending = false,
  onSubmit,
}: InputComposerProps) {
  const form = useForm<MessageComposerInput>({
    defaultValues: {
      message: "",
      model: defaultModelId,
    },
    resolver: zodResolver(messageComposerSchema),
    mode: "onSubmit",
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = form;

  const messageValue = watch("message");
  const effectiveIsSubmitting = isSubmitting || isSending;
  const messageErrorId = errors.message ? "message-error" : undefined;

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit?.(values);
    reset({ message: "", model: values.model });
  });

  return (
    <form
      aria-labelledby="message-composer-title"
      role="form"
      onSubmit={handleFormSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/95 p-4 shadow-soft-sm sm:p-6"
      noValidate
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2
            id="message-composer-title"
            className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            Message composer
          </h2>
          <span className="text-xs text-muted-foreground">
            Validated with react-hook-form &amp; Zod
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Draft your next question, choose an assistant, and send when ready.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
        <fieldset className="flex-1 space-y-2" disabled={effectiveIsSubmitting}>
          <label
            htmlFor="message-prompt"
            className="text-sm font-medium text-foreground"
          >
            Message prompt
          </label>
          <Controller
            control={control}
            name="message"
            render={({ field }) => (
              <TextareaAutosize
                {...field}
                id="message-prompt"
                className="min-h-30 w-full resize-none rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                minRows={MIN_TEXTAREA_ROWS}
                maxRows={MAX_TEXTAREA_ROWS}
                placeholder="Type your message..."
                aria-invalid={Boolean(errors.message)}
                aria-describedby={messageErrorId}
              />
            )}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span
              id={messageErrorId}
              role={errors.message ? "alert" : undefined}
              className="text-destructive"
            >
              {errors.message?.message}
            </span>
            <span aria-live="polite" aria-atomic="true">
              {messageValue?.length ?? 0}/4000
            </span>
          </div>
        </fieldset>

        <div className="flex w-full flex-col gap-3 sm:w-60">
          <fieldset className="space-y-2" disabled={effectiveIsSubmitting}>
            <legend className="text-sm font-medium text-foreground">
              Model selection
            </legend>
            <Controller
              control={control}
              name="model"
              render={({ field }) => (
                <Select.Root value={field.value} onValueChange={field.onChange}>
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
              )}
            />
            {errors.model?.message ? (
              <span role="alert" className="text-xs text-destructive">
                {errors.model.message}
              </span>
            ) : null}
          </fieldset>

          <button
            type="submit"
            disabled={effectiveIsSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-accent text-sm font-semibold text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70"
          >
            {effectiveIsSubmitting ? "Sending…" : "Send message"}
          </button>
        </div>
      </div>
    </form>
  );
}

