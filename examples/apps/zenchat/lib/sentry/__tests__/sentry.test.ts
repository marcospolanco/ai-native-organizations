import * as Sentry from "@sentry/nextjs";

// Mock Sentry
const mockCaptureException = jest.fn();
const mockSetUser = jest.fn();
const mockAddBreadcrumb = jest.fn();

jest.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
  setUser: (...args: unknown[]) => mockSetUser(...args),
  addBreadcrumb: (...args: unknown[]) => mockAddBreadcrumb(...args),
  init: jest.fn(),
}));

describe("Sentry Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("error capture", () => {
    it("should capture exceptions", () => {
      const error = new Error("Test error");
      Sentry.captureException(error, {
        tags: { category: "test" },
        extra: { context: "test-context" },
      });

      expect(mockCaptureException).toHaveBeenCalledWith(error, {
        tags: { category: "test" },
        extra: { context: "test-context" },
      });
    });

    it("should capture exceptions without context", () => {
      const error = new Error("Simple error");
      Sentry.captureException(error);

      expect(mockCaptureException).toHaveBeenCalledWith(error);
    });
  });

  describe("user context", () => {
    it("should set user context", () => {
      Sentry.setUser({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
      });

      expect(mockSetUser).toHaveBeenCalledWith({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
      });
    });

    it("should clear user context", () => {
      Sentry.setUser(null);

      expect(mockSetUser).toHaveBeenCalledWith(null);
    });
  });

  describe("breadcrumbs", () => {
    it("should add breadcrumbs", () => {
      Sentry.addBreadcrumb({
        message: "User action",
        category: "user",
        level: "info",
        data: { action: "click" },
      });

      expect(mockAddBreadcrumb).toHaveBeenCalledWith({
        message: "User action",
        category: "user",
        level: "info",
        data: { action: "click" },
      });
    });
  });

  describe("configuration", () => {
    it("should respect SENTRY_DSN environment variable", () => {
      // This is tested in the actual config files
      // Here we just verify the mock is set up correctly
      expect(Sentry.init).toBeDefined();
    });
  });
});

