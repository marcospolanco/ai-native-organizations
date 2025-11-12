import { observability, trackModelSwitch } from "@/lib/observability";
import type { ChatModelId } from "@/lib/validation";

// Mock Sentry
jest.mock("@sentry/nextjs", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  setUser: jest.fn(),
}));

// Mock analytics
jest.mock("@/lib/analytics", () => ({
  captureAnalyticsEvent: jest.fn(),
  identifyUser: jest.fn(),
  resetUser: jest.fn(),
}));

import * as Sentry from "@sentry/nextjs";
import { captureAnalyticsEvent, identifyUser, resetUser } from "@/lib/analytics";

// Type for accessing internal properties in tests
type ObservabilityTestAccess = {
  isInitialized: boolean;
  userId: string | null;
};

describe("observability", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Reset observability state
    (observability as unknown as ObservabilityTestAccess).isInitialized = false;
    (observability as unknown as ObservabilityTestAccess).userId = null;
  });

  describe("initialization", () => {
    it("should initialize without user", () => {
      observability.initialize();
      expect((observability as unknown as ObservabilityTestAccess).isInitialized).toBe(true);
    });

    it("should initialize with user", () => {
      observability.initialize("user-123");
      expect((observability as unknown as ObservabilityTestAccess).isInitialized).toBe(true);
      expect((observability as unknown as ObservabilityTestAccess).userId).toBe("user-123");
      expect(identifyUser).toHaveBeenCalledWith("user-123", undefined);
    });

    it("should not re-initialize if already initialized", () => {
      observability.initialize("user-123");
      observability.initialize("user-456");
      expect((observability as unknown as ObservabilityTestAccess).userId).toBe("user-123");
    });
  });

  describe("user management", () => {
    it("should identify user", () => {
      observability.identifyUser("user-123", { name: "Test User" });
      expect((observability as unknown as ObservabilityTestAccess).userId).toBe("user-123");
      expect(identifyUser).toHaveBeenCalledWith("user-123", { name: "Test User" });
      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: "user-123",
        name: "Test User",
      });
    });

    it("should reset user", () => {
      observability.identifyUser("user-123");
      observability.resetUser();
      expect((observability as unknown as ObservabilityTestAccess).userId).toBe(null);
      expect(resetUser).toHaveBeenCalled();
      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe("event tracking", () => {
    beforeEach(() => {
      observability.initialize();
    });

    it("should track generic events", () => {
      observability.trackEvent({
        category: "user_action",
        action: "button_clicked",
        properties: { buttonId: "submit" },
      });

      expect(captureAnalyticsEvent).toHaveBeenCalledWith("user_action_button_clicked", {
        buttonId: "submit",
        userId: null,
      });
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: "user_action: button_clicked",
        category: "user_action",
        level: "info",
        data: { buttonId: "submit" },
      });
    });

    it("should not track events if not initialized", () => {
      (observability as unknown as ObservabilityTestAccess).isInitialized = false;
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      observability.trackEvent({
        category: "user_action",
        action: "button_clicked",
      });

      expect(captureAnalyticsEvent).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("error tracking", () => {
    beforeEach(() => {
      observability.initialize();
    });

    it("should track errors", () => {
      const error = new Error("Test error");
      const context = { component: "ChatInput" };

      observability.trackError(error, context);

      expect(captureAnalyticsEvent).toHaveBeenCalledWith("error_error_occurred", {
        errorType: "Error",
        errorMessage: "Test error",
        stackTrace: error.stack,
        component: "ChatInput",
        userId: null,
      });
      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: context,
        tags: { category: "error" },
      });
    });

    it("should not track errors if not initialized", () => {
      (observability as unknown as ObservabilityTestAccess).isInitialized = false;
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const error = new Error("Test error");

      observability.trackError(error);

      expect(Sentry.captureException).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("chat-specific tracking", () => {
    beforeEach(() => {
      observability.initialize();
    });

    it("should track message sent events", () => {
      const properties = {
        model: "gpt-4o" as ChatModelId,
        messageCount: 1,
        conversationLength: 2,
      };

      observability.trackMessageSent(properties);

      expect(captureAnalyticsEvent).toHaveBeenCalledWith("chat_message_sent", {
        model: "gpt-4o",
        messageCount: 1,
        conversationLength: 2,
        userId: null,
      });
    });

    it("should track model switch", () => {
      trackModelSwitch("gpt-4o", "o4-mini");

      expect(captureAnalyticsEvent).toHaveBeenCalledWith("user_action_model_switched", {
        fromModel: "gpt-4o",
        toModel: "o4-mini",
        userId: null,
      });
    });

    it("should track conversation reset events", () => {
      const properties = {
        messageCount: 5,
        conversationLength: 10,
      };

      observability.trackConversationReset(properties);

      expect(captureAnalyticsEvent).toHaveBeenCalledWith("user_action_conversation_reset", {
        messageCount: 5,
        conversationLength: 10,
        userId: null,
      });
    });

    it("should track streaming started events", () => {
      const properties = {
        model: "gpt-4.1-mini" as ChatModelId,
        messageCount: 3,
      };

      observability.trackStreamingStarted(properties);

      expect(captureAnalyticsEvent).toHaveBeenCalledWith("chat_streaming_started", {
        model: "gpt-4.1-mini",
        messageCount: 3,
        userId: null,
      });
    });

    it("should track streaming completed events", () => {
      const properties = {
        model: "o4-mini" as ChatModelId,
        messageCount: 3,
        conversationLength: 6,
      };

      observability.trackStreamingCompleted(properties);

      expect(captureAnalyticsEvent).toHaveBeenCalledWith("chat_streaming_completed", {
        model: "o4-mini",
        messageCount: 3,
        conversationLength: 6,
        userId: null,
      });
    });

    it("should track streaming events", () => {
      observability.trackStreamingStarted({
        model: "gpt-4o",
        messageCount: 1,
      });

      expect(captureAnalyticsEvent).toHaveBeenCalledWith("chat_streaming_started", {
        model: "gpt-4o",
        messageCount: 1,
        userId: null,
      });

      observability.trackStreamingCompleted({
        model: "gpt-4o",
        messageCount: 2,
        conversationLength: 2,
      });

      expect(captureAnalyticsEvent).toHaveBeenCalledWith("chat_streaming_completed", {
        model: "gpt-4o",
        messageCount: 2,
        conversationLength: 2,
        userId: null,
      });

      observability.trackStreamingError({
        model: "gpt-4o",
        errorType: "NetworkError",
        errorMessage: "Connection failed",
      });

      expect(captureAnalyticsEvent).toHaveBeenCalledWith("error_streaming_error", {
        model: "gpt-4o",
        errorType: "NetworkError",
        errorMessage: "Connection failed",
        userId: null,
      });
    });
  });

  describe("performance tracking", () => {
    beforeEach(() => {
      observability.initialize();
      // Mock performance.now
      jest.spyOn(performance, "now").mockReturnValue(100);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should track performance metrics", () => {
      jest.spyOn(performance, "now").mockReturnValueOnce(100).mockReturnValueOnce(250);

      observability.trackPerformance("test_operation", 150, { custom: "property" });

      expect(captureAnalyticsEvent).toHaveBeenCalledWith("performance_test_operation", {
        duration: 150,
        custom: "property",
        userId: null,
      });
    });

    it("should create performance timer", () => {
      jest.spyOn(performance, "now").mockReturnValueOnce(100).mockReturnValueOnce(300);

      const timer = observability.startPerformanceTimer("timer_operation");

      expect(typeof timer).toBe("function");

      timer();

      expect(captureAnalyticsEvent).toHaveBeenCalledWith("performance_timer_operation", {
        duration: 200,
        userId: null,
      });
    });
  });

  describe("error tracking wrapper", () => {
    beforeEach(() => {
      observability.initialize();
    });

    it("should wrap async function with error tracking", async () => {
      const asyncFn = jest.fn().mockResolvedValue("success");
      const wrappedFn = observability.withErrorTracking(asyncFn, { context: "test" });

      const result = await wrappedFn("arg1", "arg2");

      expect(result).toBe("success");
      expect(asyncFn).toHaveBeenCalledWith("arg1", "arg2");
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it("should track errors from wrapped function", async () => {
      const error = new Error("Test error");
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = observability.withErrorTracking(asyncFn, { context: "test" });

      await expect(wrappedFn()).rejects.toThrow("Test error");
      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        extra: { context: "test" },
        tags: { category: "error" },
      });
    });
  });
});