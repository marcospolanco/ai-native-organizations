import "@testing-library/jest-dom";

jest.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}

if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => undefined;
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => undefined;
}

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