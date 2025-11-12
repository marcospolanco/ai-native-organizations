import { streamText } from "ai";
import { NextResponse } from "next/server";

import { getOpenAIClient } from "@/lib/ai/clients";
import { ConfigurationError } from "@/lib/errors";
import { chatRequestSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    const fieldMessages = Object.values(flattened.fieldErrors)
      .flat()
      .filter(Boolean);

    return NextResponse.json(
      {
        error: "Invalid request payload.",
        details: [...flattened.formErrors, ...fieldMessages],
      },
      { status: 400 },
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

    return result.toTextStreamResponse();
  } catch (error) {
    if (error instanceof ConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error("/api/chat error", error);
    return NextResponse.json(
      { error: "Unexpected error occurred while generating a response." },
      { status: 500 },
    );
  }
}


