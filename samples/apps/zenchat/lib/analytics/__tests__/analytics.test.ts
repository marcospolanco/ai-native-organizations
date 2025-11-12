import {
  getPostHog,
  initPostHog,
  captureAnalyticsEvent,
  identifyUser,
  resetUser,
  trackPageView,
} from "../../analytics";

// Mock PostHog
const mockPostHog = {
  capture: jest.fn(),
  identify: jest.fn(),
  reset: jest.fn(),
  debug: jest.fn(),
};

jest.mock("posthog-js", () => {
  const PostHog = jest.fn().mockImplementation((...args: unknown[]) => {
    // Accept any arguments for constructor
    return mockPostHog;
  });
  return { PostHog };
});

// Mock window and localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(window, "location", {
  value: { href: "http://localhost:3000" },
  writable: true,
});

describe("Analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    // Reset PostHog instance
    (getPostHog as any).__reset?.();
  });

  describe("PostHog initialization", () => {
    it("should return null on server side", () => {
      const originalWindow = global.window;
      // @ts-expect-error - intentionally removing window
      delete global.window;

      const result = getPostHog();
      expect(result).toBe(null);

      global.window = originalWindow;
    });

    it("should initialize PostHog with environment variables", () => {
      const originalEnv = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      process.env.NEXT_PUBLIC_POSTHOG_KEY = "test-key";
      process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://custom.posthog.com";

      const PostHog = require("posthog-js").PostHog;
      getPostHog();

      expect(PostHog).toHaveBeenCalledWith("test-key", {
        api_host: "https://custom.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: false,
        capture_pageleave: true,
        loaded: expect.any(Function),
      });

      process.env.NEXT_PUBLIC_POSTHOG_KEY = originalEnv;
    });

    it("should use default host if not provided", () => {
      const originalEnv = process.env.NEXT_PUBLIC_POSTHOG_HOST;
      delete process.env.NEXT_PUBLIC_POSTHOG_HOST;

      const PostHog = require("posthog-js").PostHog;
      getPostHog();

      expect(PostHog).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          api_host: "https://app.posthog.com",
        })
      );

      process.env.NEXT_PUBLIC_POSTHOG_HOST = originalEnv;
    });

    it("should identify user from localStorage on init", () => {
      localStorageMock.getItem.mockReturnValue("stored-user-id");
      getPostHog();

      expect(mockPostHog.identify).toHaveBeenCalledWith("stored-user-id");
    });
  });

  describe("event capture", () => {
    beforeEach(() => {
      getPostHog();
    });

    it("should capture analytics events", () => {
      captureAnalyticsEvent("test_event", { prop1: "value1", prop2: 123 });

      expect(mockPostHog.capture).toHaveBeenCalledWith("test_event", {
        prop1: "value1",
        prop2: 123,
        app: "zenchat",
        timestamp: expect.any(String),
      });
    });

    it("should handle events without properties", () => {
      captureAnalyticsEvent("simple_event");

      expect(mockPostHog.capture).toHaveBeenCalledWith("simple_event", {
        app: "zenchat",
        timestamp: expect.any(String),
      });
    });

    it("should not capture if PostHog is not available", () => {
      const originalGetPostHog = getPostHog;
      // Mock getPostHog to return null
      jest.spyOn(require("../../analytics"), "getPostHog").mockReturnValue(null);

      captureAnalyticsEvent("test_event");

      expect(mockPostHog.capture).not.toHaveBeenCalled();
    });
  });

  describe("user identification", () => {
    beforeEach(() => {
      getPostHog();
    });

    it("should identify user", () => {
      identifyUser("user-123", { name: "Test User", email: "test@example.com" });

      expect(mockPostHog.identify).toHaveBeenCalledWith("user-123", {
        name: "Test User",
        email: "test@example.com",
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith("zenchat-user-id", "user-123");
    });

    it("should store user ID in localStorage", () => {
      identifyUser("user-456");

      expect(localStorageMock.setItem).toHaveBeenCalledWith("zenchat-user-id", "user-456");
    });
  });

  describe("user reset", () => {
    beforeEach(() => {
      getPostHog();
    });

    it("should reset user", () => {
      resetUser();

      expect(mockPostHog.reset).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("zenchat-user-id");
    });
  });

  describe("page view tracking", () => {
    beforeEach(() => {
      getPostHog();
    });

    it("should track page view with current URL", () => {
      trackPageView();

      expect(mockPostHog.capture).toHaveBeenCalledWith("$pageview", {
        $current_url: "http://localhost:3000",
      });
    });

    it("should track page view with custom URL", () => {
      trackPageView("http://localhost:3000/custom-page");

      expect(mockPostHog.capture).toHaveBeenCalledWith("$pageview", {
        $current_url: "http://localhost:3000/custom-page",
      });
    });
  });

  describe("environment flag handling", () => {
    it("should not initialize PostHog if key is missing", () => {
      const originalEnv = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      delete process.env.NEXT_PUBLIC_POSTHOG_KEY;

      const PostHog = require("posthog-js").PostHog;
      getPostHog();

      // PostHog should still be called but with empty string
      expect(PostHog).toHaveBeenCalled();

      process.env.NEXT_PUBLIC_POSTHOG_KEY = originalEnv;
    });
  });
});

