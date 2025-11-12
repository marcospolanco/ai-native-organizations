import { z } from "zod";

export const chatModelIds = ["gpt-4o", "o4-mini", "gpt-4.1-mini"] as const;

export type ChatModelId = (typeof chatModelIds)[number];

export const chatModels: ReadonlyArray<{
  id: ChatModelId;
  label: string;
  description: string;
}> = [
  {
    id: "gpt-4o",
    label: "GPT-4o",
    description: "OpenAI flagship balanced for reasoning and speed",
  },
  {
    id: "o4-mini",
    label: "o4-mini",
    description: "Optimized for iterative assistant-style dialog",
  },
  {
    id: "gpt-4.1-mini",
    label: "GPT-4.1-mini",
    description: "Cost-efficient with broad multimodal support",
  },
] as const;

export const messageComposerSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, { message: "Message cannot be empty." })
    .max(4000, { message: "Message must be under 4000 characters." }),
  model: z.enum(chatModelIds, { message: "Please select a model." }),
});

export type MessageComposerInput = z.infer<typeof messageComposerSchema>;

export const chatHistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z
    .string()
    .trim()
    .min(1, { message: "Message content cannot be empty." })
    .max(6000, { message: "Message content must be under 6000 characters." }),
});

export type ChatHistoryMessage = z.infer<typeof chatHistoryMessageSchema>;

export const chatRequestSchema = messageComposerSchema.extend({
  messages: z.array(chatHistoryMessageSchema).max(50).default([]),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;

