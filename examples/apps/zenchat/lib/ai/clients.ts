import { createOpenAI } from "@ai-sdk/openai";
import { cache } from "react";

import { ConfigurationError } from "@/lib/errors";

type OpenAIClient = ReturnType<typeof createOpenAI>;

export const getOpenAIClient = cache<() => OpenAIClient>(() => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new ConfigurationError(
      "OPENAI_API_KEY is not configured. Add it to your environment to enable streaming responses.",
    );
  }

  return createOpenAI({
    apiKey,
  });
});


