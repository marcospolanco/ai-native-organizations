import { test, expect } from "@playwright/test";

test.describe("Model Switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should default to GPT-4o model", async ({ page }) => {
    const modelSelector = page.getByLabel("Select AI model");
    await expect(modelSelector).toHaveValue("gpt-4o");
  });

  test("should allow switching models during conversation", async ({ page }) => {
    const modelSelector = page.getByLabel("Select AI model");
    const messageInput = page.getByPlaceholder("Type your message...");
    const sendButton = page.getByRole("button", { name: "Send message" });

    // Start with default model
    await expect(modelSelector).toHaveValue("gpt-4o");

    // Send a message
    await messageInput.fill("Hello, how are you?");
    await sendButton.click();

    // Wait for user message to appear
    await expect(page.getByText("Hello, how are you?")).toBeVisible();

    // Switch model while conversation is active
    await modelSelector.selectOption("o4-mini");
    await expect(modelSelector).toHaveValue("o4-mini");

    // Send another message with new model
    await messageInput.fill("What can you tell me about AI?");
    await sendButton.click();

    // Verify both messages remain in conversation
    await expect(page.getByText("Hello, how are you?")).toBeVisible();
    await expect(page.getByText("What can you tell me about AI?")).toBeVisible();

    // Verify model selection persisted
    await expect(modelSelector).toHaveValue("o4-mini");
  });

  test("should maintain conversation context when switching models", async ({ page }) => {
    const modelSelector = page.getByLabel("Select AI model");
    const messageInput = page.getByPlaceholder("Type your message...");
    const sendButton = page.getByRole("button", { name: "Send message" });

    // Send initial message
    await messageInput.fill("My name is Alice");
    await sendButton.click();
    await expect(page.getByText("My name is Alice")).toBeVisible();

    // Switch model
    await modelSelector.selectOption("gpt-4.1-mini");
    await expect(modelSelector).toHaveValue("gpt-4.1-mini");

    // Send follow-up message referencing previous context
    await messageInput.fill("What did I just tell you my name is?");
    await sendButton.click();

    // Verify conversation continuity
    await expect(page.getByText("My name is Alice")).toBeVisible();
    await expect(page.getByText("What did I just tell you my name is?")).toBeVisible();
    await expect(modelSelector).toHaveValue("gpt-4.1-mini");
  });

  test("should reset conversation when using reset button", async ({ page }) => {
    const modelSelector = page.getByLabel("Select AI model");
    const messageInput = page.getByPlaceholder("Type your message...");
    const sendButton = page.getByRole("button", { name: "Send message" });
    const resetButton = page.getByRole("button", { name: "Reset conversation" });

    // Send some messages and change model
    await messageInput.fill("Test message 1");
    await sendButton.click();
    await modelSelector.selectOption("o4-mini");
    await messageInput.fill("Test message 2");
    await sendButton.click();

    // Verify conversation state
    await expect(page.getByText("Test message 1")).toBeVisible();
    await expect(page.getByText("Test message 2")).toBeVisible();
    await expect(modelSelector).toHaveValue("o4-mini");

    // Reset conversation
    await resetButton.click();

    // Verify reset state
    await expect(page.getByText("Test message 1")).not.toBeVisible();
    await expect(page.getByText("Test message 2")).not.toBeVisible();
    await expect(modelSelector).toHaveValue("gpt-4o"); // Should reset to default
  });

  test("should persist model selection across page refreshes", async ({ page }) => {
    const modelSelector = page.getByLabel("Select AI model");

    // Change model
    await modelSelector.selectOption("gpt-4.1-mini");
    await expect(modelSelector).toHaveValue("gpt-4.1-mini");

    // Refresh page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify model selection persisted
    await expect(modelSelector).toHaveValue("gpt-4.1-mini");
  });

  test("should handle rapid model switching gracefully", async ({ page }) => {
    const modelSelector = page.getByLabel("Select AI model");
    const messageInput = page.getByPlaceholder("Type your message...");
    const sendButton = page.getByRole("button", { name: "Send message" });

    // Send message
    await messageInput.fill("Test rapid switching");
    await sendButton.click();

    // Rapidly switch between models
    await modelSelector.selectOption("o4-mini");
    await expect(modelSelector).toHaveValue("o4-mini");

    await modelSelector.selectOption("gpt-4.1-mini");
    await expect(modelSelector).toHaveValue("gpt-4.1-mini");

    await modelSelector.selectOption("gpt-4o");
    await expect(modelSelector).toHaveValue("gpt-4o");

    // Verify conversation still intact
    await expect(page.getByText("Test rapid switching")).toBeVisible();

    // Send another message to ensure functionality still works
    await messageInput.fill("Still working?");
    await sendButton.click();
    await expect(page.getByText("Still working?")).toBeVisible();
  });

  test("should maintain conversation when switching models mid-response", async ({ page }) => {
    const modelSelector = page.getByLabel("Select AI model");
    const messageInput = page.getByPlaceholder("Type your message...");
    const sendButton = page.getByRole("button", { name: "Send message" });

    // Send initial message
    await messageInput.fill("Tell me a long story");
    await sendButton.click();

    // Wait for response to start streaming
    await page.waitForTimeout(500); // Give time for streaming to start

    // Switch model while response is streaming
    await modelSelector.selectOption("o4-mini");
    await expect(modelSelector).toHaveValue("o4-mini");

    // Wait for response to complete (or timeout)
    await page.waitForTimeout(3000);

    // Verify initial message is still present
    await expect(page.getByText("Tell me a long story")).toBeVisible();

    // Verify model selection persisted
    await expect(modelSelector).toHaveValue("o4-mini");

    // Send another message to verify conversation continues
    await messageInput.fill("Continue the story");
    await sendButton.click();

    // Verify both messages are in conversation
    await expect(page.getByText("Tell me a long story")).toBeVisible();
    await expect(page.getByText("Continue the story")).toBeVisible();
  });

  test("should switch models after response completion", async ({ page }) => {
    const modelSelector = page.getByLabel("Select AI model");
    const messageInput = page.getByPlaceholder("Type your message...");
    const sendButton = page.getByRole("button", { name: "Send message" });

    // Send message and wait for response
    await messageInput.fill("Hello");
    await sendButton.click();

    // Wait for response to complete (look for any assistant response)
    await page.waitForTimeout(5000);

    // Switch model after response is complete
    await modelSelector.selectOption("gpt-4.1-mini");
    await expect(modelSelector).toHaveValue("gpt-4.1-mini");

    // Verify conversation history is maintained
    await expect(page.getByText("Hello")).toBeVisible();

    // Send follow-up message with new model
    await messageInput.fill("What model are you using?");
    await sendButton.click();

    // Verify both messages remain
    await expect(page.getByText("Hello")).toBeVisible();
    await expect(page.getByText("What model are you using?")).toBeVisible();
  });
});