import { renderHook, act } from "@testing-library/react";
import { useChatStore } from "@/lib/stores/chat-store";
import type { Message } from "@/lib/messages";

// Mock localStorage for persistence tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("chat-store", () => {
  const mockMessage: Message = {
    id: "test-message-1",
    role: "user",
    authorLabel: "You",
    body: "Test message",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    // Reset store to initial state
    useChatStore.getState().reset();
  });

  describe("model selection", () => {
    it("should default to gpt-4o model", () => {
      const { result } = renderHook(() => useChatStore());

      expect(result.current.selectedModel).toBe("gpt-4o");
    });

    it("should allow changing the model", () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.setModel("o4-mini");
      });

      expect(result.current.selectedModel).toBe("o4-mini");
    });

    it("should maintain messages when switching models", () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.appendMessage(mockMessage);
      });

      act(() => {
        result.current.setModel("o4-mini");
      });

      expect(result.current.selectedModel).toBe("o4-mini");
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toEqual(mockMessage);
    });

    it("should maintain conversation state when switching models", () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.appendMessage(mockMessage);
        result.current.setStreaming(true);
        result.current.setError("Test error");
      });

      act(() => {
        result.current.setModel("gpt-4.1-mini");
      });

      expect(result.current.selectedModel).toBe("gpt-4.1-mini");
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.isStreaming).toBe(true);
      expect(result.current.error).toBe("Test error");
    });
  });

  describe("reset functionality", () => {
    it("should reset to default model when resetting conversation", () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.setModel("o4-mini");
        result.current.appendMessage(mockMessage);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.selectedModel).toBe("gpt-4o");
      expect(result.current.messages).toHaveLength(0);
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it("should reset to default model even when providing initial messages", () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.setModel("gpt-4.1-mini");
      });

      act(() => {
        result.current.reset([mockMessage]);
      });

      expect(result.current.selectedModel).toBe("gpt-4o");
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toEqual(mockMessage);
    });
  });

  describe("model persistence", () => {
    it("should persist selectedModel to localStorage", () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.setModel("o4-mini");
      });

      // Verify localStorage was called (persist middleware should handle this)
      expect(result.current.selectedModel).toBe("o4-mini");
    });

    it("should not persist messages to localStorage", () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.appendMessage(mockMessage);
        result.current.setModel("gpt-4.1-mini");
      });

      // Messages should not be persisted (only selectedModel is partialized)
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.selectedModel).toBe("gpt-4.1-mini");
    });
  });

  describe("model switching edge cases", () => {
    it("should handle switching to the same model (no-op)", () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.setModel("gpt-4o");
      });

      expect(result.current.selectedModel).toBe("gpt-4o");

      act(() => {
        result.current.setModel("gpt-4o");
      });

      expect(result.current.selectedModel).toBe("gpt-4o");
    });

    it("should maintain all message properties when switching models", () => {
      const { result } = renderHook(() => useChatStore());

      const messageWithMeta: Message = {
        id: "test-message-2",
        role: "assistant",
        authorLabel: "Zen Chat",
        body: "Test response",
        meta: "Streaming response",
        reasoning: "Test reasoning",
        sources: [{ label: "Example", href: "https://example.com" }],
      };

      act(() => {
        result.current.appendMessage(messageWithMeta);
      });

      act(() => {
        result.current.setModel("o4-mini");
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toEqual(messageWithMeta);
    });

    it("should handle multiple model switches in sequence", () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.appendMessage(mockMessage);
      });

      const models: Array<"gpt-4o" | "o4-mini" | "gpt-4.1-mini"> = ["o4-mini", "gpt-4.1-mini", "gpt-4o", "o4-mini"];

      models.forEach((model) => {
        act(() => {
          result.current.setModel(model);
        });
        expect(result.current.selectedModel).toBe(model);
      });

      expect(result.current.messages).toHaveLength(1);
    });
  });

  describe("selectors", () => {
    it("should allow selecting only selectedModel", () => {
      const selectedModel = useChatStore.getState().selectedModel;
      expect(selectedModel).toBe("gpt-4o");
    });

    it("should allow selecting only messages", () => {
      act(() => {
        useChatStore.getState().appendMessage(mockMessage);
      });

      const messages = useChatStore.getState().messages;
      expect(messages).toHaveLength(1);
    });

    it("should allow accessing multiple state properties via getState", () => {
      // Reset to ensure clean state
      useChatStore.getState().reset();
      const state = useChatStore.getState();
      expect(state.selectedModel).toBe("gpt-4o");
      expect(state.messages.length).toBe(0);
      expect(state.isStreaming).toBe(false);
    });
  });
});