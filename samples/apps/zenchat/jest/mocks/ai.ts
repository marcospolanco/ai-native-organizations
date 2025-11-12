export async function streamText(config?: {
  model?: unknown;
  messages?: Array<{ role: string; content: string }>;
}) {
  // Simulate streaming tokens - generate response based on input
  const userMessage = config?.messages?.[config.messages.length - 1]?.content || "";
  const responseText = userMessage
    ? `This is a mock response to: "${userMessage}". It simulates streaming by breaking the response into tokens.`
    : "Hello! How can I help you today?";

  // Break response into realistic tokens (words and punctuation)
  const tokens = responseText
    .split(/(\s+)/)
    .filter((token) => token.trim().length > 0)
    .concat([" "])
    .flatMap((token) => {
      // Split longer words into smaller chunks for more realistic streaming
      if (token.length > 5) {
        return [token.slice(0, Math.ceil(token.length / 2)), token.slice(Math.ceil(token.length / 2))];
      }
      return [token];
    });

  const textStream = {
    async *[Symbol.asyncIterator]() {
      for (const token of tokens) {
        yield token;
        // Simulate realistic async delay (faster in tests)
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
    },
  };

  const result = {
    textStream,
    toTextStreamResponse: () => {
      // Create a mock Response for SSE streaming
      // Format: AI SDK data stream format
      const encoder = new TextEncoder();
      let streamIndex = 0;

      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Send initial stream start marker
            controller.enqueue(encoder.encode(`0:"${tokens[0]}"\n`));
            streamIndex++;

            // Send remaining tokens
            for (let i = 1; i < tokens.length; i++) {
              const token = tokens[i];
              // Format: streamIndex:"token"
              const data = `${streamIndex}:"${token}"\n`;
              controller.enqueue(encoder.encode(data));
              streamIndex++;
              // Simulate realistic delay
              await new Promise((resolve) => setTimeout(resolve, 5));
            }

            // Send stream end marker
            controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    },
  };

  return result;
}


