import { streamText, convertToModelMessages } from "ai";
import { NextResponse } from "next/server";

import { getOpenAIClient } from "@/lib/ai/clients";
import { ConfigurationError } from "@/lib/errors";

export async function POST(request: Request) {
  const body = await request.json();
  
  // AI SDK's useChat sends all messages (including the new one) in the messages array
  const { messages, model } = body;

  try {
    const openai = getOpenAIClient();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required and must not be empty." },
        { status: 400 }
      );
    }
    
    // Use AI SDK's built-in conversion for UIMessage format
    let apiMessages: any[];
    try {
      apiMessages = convertToModelMessages(messages);
    } catch (conversionError) {
      console.error("Failed to convert messages with AI SDK, falling back to manual conversion:", conversionError);
      
      // Manual fallback conversion
      apiMessages = messages.map((historyMessage: any) => {
        let content = "";
        
        // Extract content from parts array
        if (historyMessage.parts && Array.isArray(historyMessage.parts)) {
          const textParts = historyMessage.parts.filter((part: any) => part.type === "text");
          content = textParts.map((part: any) => part.text).join("");
        }
        
        // Fallback to content or text field if parts doesn't exist
        if (!content) {
          content = historyMessage.content || historyMessage.text || "";
        }
        
        return {
          role: historyMessage.role,
          content: content,
        };
      });
    }

    const result = streamText({
      model: openai(model || "gpt-4o"),
      messages: apiMessages,
    });

    // Use toUIMessageStreamResponse to match AI SDK's useChat format
    return result.toUIMessageStreamResponse();
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


