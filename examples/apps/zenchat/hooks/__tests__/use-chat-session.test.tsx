import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { useChatSession } from "../use-chat-session";
import { useChatStore } from "@/lib/stores/chat-store";
import { sendMessageAction } from "@/app/actions/send-message";

// Mock the server action
jest.mock("@/app/actions/send-message", () => ({
  sendMessageAction: jest.fn(),
}));



const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useChatSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the store
    useChatStore.getState().reset();
  });

  describe("initialization", () => {
    it("should initialize with empty messages", () => {
      const { result } = renderHook(() => useChatSession(), {
        wrapper: createWrapper(),
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.isSending).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    it("should initialize with initial messages", () => {
      const initialMessages = [
        {
          id: "1",
          role: "user" as const,
          authorLabel: "You",
          body: "Hello",
        },
        {
          id: "2",
          role: "assistant" as const,
          authorLabel: "Zen Chat",
          body: "Hi there!",
        },
      ];

      const { result } = renderHook(
        () => useChatSession({ initialMessages }),
        {
          wrapper: createWrapper(),
        },
      );

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].body).toBe("Hello");
      expect(result.current.messages[1].body).toBe("Hi there!");
    });
  });

  describe("state transitions", () => {
    it("should set isSending to true when submitting", async () => {
      const mockSendMessageAction = sendMessageAction as jest.MockedFunction<
        typeof sendMessageAction
      >;

      mockSendMessageAction.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return {
          stream: {} as any,
        };
      });

      const { result } = renderHook(() => useChatSession(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.handleSubmit({
          message: "Hello",
          model: "gpt-4o",
        });
      });

      // isSending should be true while request is in flight
      expect(result.current.isSending).toBe(true);
    });

    it("should set isStreaming to true when stream starts", async () => {
      // Import createStreamableValue from the mocked module
      const { createStreamableValue } = await import("@ai-sdk/rsc");
      const streamable = createStreamableValue("");

      const mockSendMessageAction = sendMessageAction as jest.MockedFunction<
        typeof sendMessageAction
      >;

      mockSendMessageAction.mockResolvedValue({
        stream: streamable.value,
      });

      const { result } = renderHook(() => useChatSession(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.handleSubmit({
          message: "Hello",
          model: "gpt-4o",
        });
      });

      // Wait for streaming state to update
      await waitFor(() => {
        expect(result.current.isStreaming).toBe(true);
      });
    });

    it("should set error when request fails", async () => {
      const mockSendMessageAction = sendMessageAction as jest.MockedFunction<
        typeof sendMessageAction
      >;

      mockSendMessageAction.mockRejectedValue(new Error("Request failed"));

      const { result } = renderHook(() => useChatSession(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.handleSubmit({
          message: "Hello",
          model: "gpt-4o",
        });
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error).toContain("Request failed");
      });

      expect(result.current.isSending).toBe(false);
      expect(result.current.isStreaming).toBe(false);
    });

    it("should set error when server returns error", async () => {
      const mockSendMessageAction = sendMessageAction as jest.MockedFunction<
        typeof sendMessageAction
      >;

      mockSendMessageAction.mockResolvedValue({
        error: "Unable to generate response",
      });

      const { result } = renderHook(() => useChatSession(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.handleSubmit({
          message: "Hello",
          model: "gpt-4o",
        });
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error).toContain("Unable to generate response");
      });
    });
  });

  describe("streaming updates", () => {
    it("should update message body as stream progresses", async () => {
      const { createStreamableValue } = await import("@ai-sdk/rsc");
      const streamable = createStreamableValue("");

      const mockSendMessageAction = sendMessageAction as jest.MockedFunction<
        typeof sendMessageAction
      >;

      mockSendMessageAction.mockResolvedValue({
        stream: streamable.value,
      });

      const { result } = renderHook(() => useChatSession(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.handleSubmit({
          message: "Hello",
          model: "gpt-4o",
        });
      });

      // Wait for assistant message to be created
      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
        expect(result.current.messages[0].role).toBe("user");
        expect(result.current.messages[1].role).toBe("assistant");
      });

      // Simulate streaming tokens
      act(() => {
        streamable.append("Hello world");
      });

      await waitFor(() => {
        const assistantMessage = result.current.messages.find(
          (m) => m.role === "assistant",
        );
        expect(assistantMessage?.body).toBe("Hello world");
      });
    });

    it("should mark message as streaming while in progress", async () => {
      const { createStreamableValue } = await import("@ai-sdk/rsc");
      const streamable = createStreamableValue("");

      const mockSendMessageAction = sendMessageAction as jest.MockedFunction<
        typeof sendMessageAction
      >;

      mockSendMessageAction.mockResolvedValue({
        stream: streamable.value,
      });

      const { result } = renderHook(() => useChatSession(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.handleSubmit({
          message: "Hello",
          model: "gpt-4o",
        });
      });

      await waitFor(() => {
        const assistantMessage = result.current.messages.find(
          (m) => m.role === "assistant",
        );
        expect(assistantMessage?.meta).toBe("Streaming response");
      });
    });

    it("should clear meta when streaming completes", async () => {
      const { createStreamableValue } = await import("@ai-sdk/rsc");
      const streamable = createStreamableValue("");

      const mockSendMessageAction = sendMessageAction as jest.MockedFunction<
        typeof sendMessageAction
      >;

      mockSendMessageAction.mockResolvedValue({
        stream: streamable.value,
      });

      const { result } = renderHook(() => useChatSession(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.handleSubmit({
          message: "Hello",
          model: "gpt-4o",
        });
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });

      // Complete the stream
      act(() => {
        streamable.done("Hello world");
      });

      await waitFor(() => {
        expect(result.current.isStreaming).toBe(false);
      });

      await waitFor(() => {
        const assistantMessage = result.current.messages.find(
          (m) => m.role === "assistant",
        );
        expect(assistantMessage?.meta).toBeUndefined();
      });
    });
  });

  describe("message history", () => {
    it("should include message history in request", async () => {
      const mockSendMessageAction = sendMessageAction as jest.MockedFunction<
        typeof sendMessageAction
      >;

      const { createStreamableValue } = await import("@ai-sdk/rsc");
      const streamable = createStreamableValue("");

      mockSendMessageAction.mockResolvedValue({
        stream: streamable.value,
      });

      const { result } = renderHook(() => useChatSession(), {
        wrapper: createWrapper(),
      });

      // Send first message
      await act(async () => {
        await result.current.handleSubmit({
          message: "First message",
          model: "gpt-4o",
        });
      });

      // Complete first stream
      act(() => {
        streamable.done("First response");
      });

      await waitFor(() => {
        expect(result.current.isStreaming).toBe(false);
      });

      await waitFor(() => {
        const assistantMessage = result.current.messages.find(
          (m) => m.role === "assistant",
        );
        expect(assistantMessage?.body).toBe("First response");
      });

      // Send second message
      await act(async () => {
        await result.current.handleSubmit({
          message: "Second message",
          model: "gpt-4o",
        });
      });

      // Verify history was included
      expect(mockSendMessageAction).toHaveBeenCalledTimes(2);
    });

    it("should only include user and assistant messages in history", async () => {
      const mockSendMessageAction = sendMessageAction as jest.MockedFunction<
        typeof sendMessageAction
      >;

      const { createStreamableValue } = await import("@ai-sdk/rsc");
      const streamable = createStreamableValue("");

      mockSendMessageAction.mockResolvedValue({
        stream: streamable.value,
      });

      const initialMessages = [
        {
          id: "1",
          role: "user" as const,
          authorLabel: "You",
          body: "Initial message",
        },
      ];

      const { result } = renderHook(
        () => useChatSession({ initialMessages }),
        {
          wrapper: createWrapper(),
        },
      );

      await act(async () => {
        await result.current.handleSubmit({
          message: "Follow up",
          model: "gpt-4o",
        });
      });

      // Verify history includes initial message
      expect(mockSendMessageAction).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "user",
              content: "Initial message",
            }),
          ]),
        }),
      );
    });
  });

  describe("reset conversation", () => {
    it("should reset messages and state", async () => {
      const { createStreamableValue } = await import("@ai-sdk/rsc");
      const streamable = createStreamableValue("");

      const mockSendMessageAction = sendMessageAction as jest.MockedFunction<
        typeof sendMessageAction
      >;

      mockSendMessageAction.mockResolvedValue({
        stream: streamable.value,
      });

      const initialMessages = [
        {
          id: "1",
          role: "user" as const,
          authorLabel: "You",
          body: "Initial message",
        },
      ];

      const { result } = renderHook(
        () => useChatSession({ initialMessages }),
        {
          wrapper: createWrapper(),
        },
      );

      // Send a message
      await act(async () => {
        await result.current.handleSubmit({
          message: "Hello",
          model: "gpt-4o",
        });
      });

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(1);
      });

      // Reset conversation
      act(() => {
        result.current.resetConversation();
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].body).toBe("Initial message");
        expect(result.current.isStreaming).toBe(false);
        expect(result.current.error).toBeUndefined();
      });
    });
  });

  describe("error handling", () => {
    it("should handle streaming errors", async () => {
      const { createStreamableValue } = await import("@ai-sdk/rsc");
      const streamable = createStreamableValue("");

      const mockSendMessageAction = sendMessageAction as jest.MockedFunction<
        typeof sendMessageAction
      >;

      mockSendMessageAction.mockResolvedValue({
        stream: streamable.value,
      });

      const { result } = renderHook(() => useChatSession(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.handleSubmit({
          message: "Hello",
          model: "gpt-4o",
        });
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });

      // Simulate stream error
      act(() => {
        streamable.error(new Error("Stream error"));
      });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.isStreaming).toBe(false);
      });
    });

    it("should update message meta on error", async () => {
      const { createStreamableValue } = await import("@ai-sdk/rsc");
      const streamable = createStreamableValue("");

      const mockSendMessageAction = sendMessageAction as jest.MockedFunction<
        typeof sendMessageAction
      >;

      mockSendMessageAction.mockResolvedValue({
        stream: streamable.value,
      });

      const { result } = renderHook(() => useChatSession(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.handleSubmit({
          message: "Hello",
          model: "gpt-4o",
        });
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });

      // Simulate stream error
      act(() => {
        streamable.error(new Error("Stream error"));
      });

      await waitFor(() => {
        const assistantMessage = result.current.messages.find(
          (m) => m.role === "assistant",
        );
        expect(assistantMessage?.meta).toBe("Streaming failed");
      });
    });
  });
});

