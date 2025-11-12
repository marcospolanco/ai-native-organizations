// Polyfill for crypto.randomUUID in jsdom environment
// jsdom provides a crypto object but it doesn't have randomUUID
const nodeCrypto = require("crypto");

// Check if we're in a jsdom environment (has crypto but no randomUUID)
if (typeof window !== "undefined" && window.crypto && !window.crypto.randomUUID) {
  // Add randomUUID to window.crypto
  Object.defineProperty(window.crypto, "randomUUID", {
    value: () => nodeCrypto.randomUUID(),
    writable: true,
    configurable: true,
    enumerable: false,
  });
}

// Also ensure globalThis.crypto has randomUUID
if (typeof globalThis.crypto !== "undefined" && !globalThis.crypto.randomUUID) {
  Object.defineProperty(globalThis.crypto, "randomUUID", {
    value: () => nodeCrypto.randomUUID(),
    writable: true,
    configurable: true,
    enumerable: false,
  });
}

// Polyfill for Request and Response in Node.js environment
// Node.js 18+ includes global fetch, Request, and Response
// For Jest tests, we ensure these are available
if (typeof globalThis.Request === "undefined") {
  // Use Node's built-in fetch if available (Node 18+)
  if (typeof fetch !== "undefined") {
    // fetch is available, but Request might not be in global scope
    // Try to access it from the fetch implementation
    try {
      const testRequest = new (globalThis as any).Request("http://localhost");
      if (!testRequest) throw new Error("Request not available");
    } catch {
      // Create minimal polyfill for Request
      (globalThis as any).Request = class Request {
        input: string | Request;
        init?: RequestInit;
        headers: Headers;
        method: string;
        url: string;

        constructor(input: string | Request, init?: RequestInit) {
          this.input = input;
          this.init = init || {};
          this.headers = new Headers(this.init.headers);
          this.method = this.init.method || "GET";
          this.url = typeof input === "string" ? input : input.url;
        }

        async json(): Promise<any> {
          if (typeof this.init?.body === "string") {
            return JSON.parse(this.init.body);
          }
          return {};
        }

        async text(): Promise<string> {
          if (typeof this.init?.body === "string") {
            return this.init.body;
          }
          return "";
        }

        async arrayBuffer(): Promise<ArrayBuffer> {
          if (this.init?.body) {
            return new TextEncoder().encode(
              typeof this.init.body === "string"
                ? this.init.body
                : JSON.stringify(this.init.body),
            ).buffer;
          }
          return new ArrayBuffer(0);
        }
      };
    }
  }
}
