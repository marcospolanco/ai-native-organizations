import { ConfigurationError } from "@/lib/errors";
import { POST } from "../route";

// Mock the OpenAI client
const mockGetOpenAIClient = jest.fn(() => (modelId: string) => modelId);
jest.mock("@/lib/ai/clients", () => ({
  getOpenAIClient: () => mockGetOpenAIClient(),
}));

describe("POST /api/chat", () => {
  beforeEach(() => {
    // Reset mock to default implementation
    mockGetOpenAIClient.mockReturnValue((modelId: string) => modelId);
    process.env.OPENAI_API_KEY = "test-api-key";
  });

  afterEach(() => {
    // Reset mock to default implementation
    mockGetOpenAIClient.mockReturnValue((modelId: string) => modelId);
    process.env.OPENAI_API_KEY = "test-api-key";
  });

  describe("validation", () => {
    it("should return 400 for empty message", async () => {
      const request = new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "",
          model: "gpt-4o",
          messages: [],
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error).toBe("Invalid request payload.");
      expect(body.details).toBeDefined();
      expect(Array.isArray(body.details)).toBe(true);
    });

    it("should return 400 for message exceeding max length", async () => {
      const request = new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "a".repeat(4001),
          model: "gpt-4o",
          messages: [],
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error).toBe("Invalid request payload.");
    });

    it("should return 400 for invalid model", async () => {
      const request = new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Hello",
          model: "invalid-model",
          messages: [],
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("should return 400 for invalid message history", async () => {
      const request = new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Hello",
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: "",
            },
          ],
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("should return 400 for missing required fields", async () => {
      const request = new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Hello",
          // model is missing
          messages: [],
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe("streaming", () => {
    it("should return SSE stream for valid input", async () => {
      const request = new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Hello, how are you?",
          model: "gpt-4o",
          messages: [],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("text/event-stream");
      expect(response.headers.get("Cache-Control")).toContain("no-cache");
      expect(response.headers.get("Connection")).toBe("keep-alive");
    });

    it("should include message history in request", async () => {
      const request = new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Follow up question",
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: "Initial question",
            },
            {
              role: "assistant",
              content: "Initial response",
            },
          ],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("text/event-stream");
    });

    it("should stream incremental tokens", async () => {
      const request = new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Hello",
          model: "gpt-4o",
          messages: [],
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const chunks: string[] = [];

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) {
            chunks.push(decoder.decode(value, { stream: true }));
          }
        }
      }

      // Verify we received stream chunks
      expect(chunks.length).toBeGreaterThan(0);
      const combined = chunks.join("");
      // Mock generates response based on input message
      expect(combined).toContain("mock");
      expect(combined.length).toBeGreaterThan(0);
    });
  });

  describe("error handling", () => {
    it("should return 500 for ConfigurationError", async () => {
      // Mock getOpenAIClient to throw ConfigurationError
      mockGetOpenAIClient.mockImplementation(() => {
        throw new ConfigurationError("OPENAI_API_KEY is not configured");
      });

      const request = new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Hello",
          model: "gpt-4o",
          messages: [],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toContain("OPENAI_API_KEY");
    });

    it("should return 500 for unexpected errors", async () => {
      // Mock getOpenAIClient to throw a generic error (not ConfigurationError)
      mockGetOpenAIClient.mockImplementation(() => {
        throw new Error("Unexpected error occurred while generating a response.");
      });

      const request = new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Hello",
          model: "gpt-4o",
          messages: [],
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe("Unexpected error occurred while generating a response.");
    });
  });

  describe("SSE stream structure", () => {
    it("should format SSE chunks correctly", async () => {
      // Ensure API key is set (should already be set by beforeEach)
      process.env.OPENAI_API_KEY = "test-api-key";

      const request = new Request("http://localhost/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Test",
          model: "gpt-4o",
          messages: [],
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      // Read stream to verify format
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const chunks: string[] = [];

      if (reader) {
        let done = false;
        // Read until stream is complete
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) {
            chunks.push(decoder.decode(value, { stream: true }));
          }
        }
        reader.releaseLock();
      }

      // Verify chunks contain SSE format
      const combined = chunks.join("");
      // SSE format should have data lines with stream index and token
      expect(combined.length).toBeGreaterThan(0);
      // Should contain stream format markers (index:"token")
      expect(combined).toMatch(/\d+:"/);
      // Should contain finish reason (may be in a separate chunk)
      // Since we're reading the full stream, finishReason should be present
      expect(combined).toMatch(/finishReason|d:/);
    });
  });
});

