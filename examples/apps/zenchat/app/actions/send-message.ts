"use server";

import { streamText } from "ai";
import { createStreamableValue, type StreamableValue } from "@ai-sdk/rsc";

import { getOpenAIClient } from "@/lib/ai/clients";
import { ConfigurationError, ValidationError } from "@/lib/errors";
import { chatRequestSchema, type ChatRequestInput } from "@/lib/validation";

export type SendMessageActionResult = {
  stream?: StreamableValue<string>;
  error?: string;
};

export async function sendMessageAction(
  input: ChatRequestInput,
): Promise<SendMessageActionResult> {
  const parsed = chatRequestSchema.safeParse(input);

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    const fieldMessages = Object.values(flattened.fieldErrors)
      .flat()
      .filter(Boolean);
    const combinedMessages = [...flattened.formErrors, ...fieldMessages].join("\n");

    throw new ValidationError(
      combinedMessages || "Invalid request payload. Please review your input and try again.",
    );
  }

  try {
    const openai = getOpenAIClient();
    const { messages, message, model } = parsed.data;

    const result = await streamText({
      model: openai(model),
      messages: [
        ...messages.map((historyMessage) => ({
          role: historyMessage.role,
          content: historyMessage.content,
        })),
        {
          role: "user" as const,
          content: message,
        },
      ],
    });

    const streamable = createStreamableValue<string>("");

    void (async () => {
      try {
        console.log("Starting to stream text from AI...");
        for await (const delta of result.textStream) {
          console.log("Received delta:", delta);
          streamable.append(delta);
        }
        console.log("Stream completed.");
        streamable.done();
      } catch (streamError) {
        console.error("Stream error:", streamError);
        streamable.error(streamError);
      }
    })();

    return {
      stream: streamable.value,
    };
  } catch (error) {
    if (error instanceof ConfigurationError || error instanceof ValidationError) {
      throw error;
    }

    console.error("sendMessageAction error", error);

    return {
      error: "Unable to generate a response. Please try again.",
    };
  }
}


