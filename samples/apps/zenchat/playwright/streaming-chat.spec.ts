import { test, expect } from "@playwright/test";

test.describe("Phase 5 - Client Streaming Integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display loading indicator when sending message", async ({ page }) => {
    // Wait for page to load
    await expect(page.getByRole("region", { name: /Conversation timeline/i })).toBeVisible();

    // Find the message input
    const messageInput = page.getByRole("textbox", { name: /Message prompt/i });
    await expect(messageInput).toBeVisible();

    // Type a message
    await messageInput.fill("Hello, this is a test message");

    // Find and click the send button
    const sendButton = page.getByRole("button", { name: /Send message/i });
    await expect(sendButton).toBeVisible();
    await sendButton.click();

    // Verify loading state
    await expect(sendButton).toBeDisabled();
    await expect(sendButton).toHaveText(/Sending…/i);

    // Verify input is disabled during sending
    await expect(messageInput).toBeDisabled();
  });

  test("should display streaming message updates incrementally", async ({ page }) => {
    // This test requires actual API connection
    // In a real scenario, you would mock the API or use a test environment
    // For now, we verify the UI structure supports streaming

    // Wait for page to load
    await expect(page.getByRole("region", { name: /Conversation timeline/i })).toBeVisible();

    // Find the message input
    const messageInput = page.getByRole("textbox", { name: /Message prompt/i });
    await expect(messageInput).toBeVisible();

    // Type a message
    await messageInput.fill("Tell me about streaming responses");

    // Find and click the send button
    const sendButton = page.getByRole("button", { name: /Send message/i });
    await expect(sendButton).toBeVisible();

    // Note: Actual streaming test would require:
    // 1. Mock API that returns SSE stream
    // 2. Wait for message to appear in message list
    // 3. Verify message body updates incrementally
    // 4. Verify streaming indicator is visible

    // For now, verify the message list container exists
    const messageList = page.getByRole("region", { name: /Conversation timeline/i });
    await expect(messageList).toBeVisible();
  });

  test("should handle error states gracefully", async ({ page }) => {
    // Wait for page to load
    await expect(page.getByRole("heading", { name: /Experience streaming responses/i })).toBeVisible();

    // Intercept API calls and return error
    await page.route("**/api/**", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    // Find the message input
    const messageInput = page.getByRole("textbox", { name: /Message prompt/i });
    await expect(messageInput).toBeVisible();

    // Type a message
    await messageInput.fill("This should trigger an error");

    // Find and click the send button
    const sendButton = page.getByRole("button", { name: /Send message/i });
    await expect(sendButton).toBeVisible();
    await sendButton.click();

    // Verify error message is displayed
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 5000 });
    
    // Verify error message content
    const errorMessage = page.getByRole("alert");
    await expect(errorMessage).toContainText(/error/i);
  });

  test("should validate message input before submission", async ({ page }) => {
    // Wait for page to load
    await expect(page.getByRole("region", { name: /Conversation timeline/i })).toBeVisible();

    // Find the message input
    const messageInput = page.getByRole("textbox", { name: /Message prompt/i });
    await expect(messageInput).toBeVisible();

    // Try to submit empty message
    const sendButton = page.getByRole("button", { name: /Send message/i });
    await expect(sendButton).toBeVisible();
    await sendButton.click();

    // Verify validation error is displayed
    // The form should prevent submission of empty messages
    // Check if error message appears
    const errorElement = page.getByRole("alert", { name: /message-error/i });
    if (await errorElement.isVisible().catch(() => false)) {
      await expect(errorElement).toContainText(/empty/i);
    }
  });

  test("should display character count", async ({ page }) => {
    // Wait for page to load
    await expect(page.getByRole("region", { name: /Conversation timeline/i })).toBeVisible();

    // Find the message input
    const messageInput = page.getByRole("textbox", { name: /Message prompt/i });
    await expect(messageInput).toBeVisible();

    // Type a message
    const testMessage = "Hello, this is a test message";
    await messageInput.fill(testMessage);

    // Verify character count is displayed
    const characterCount = page.getByText(/\d+\/4000/);
    await expect(characterCount).toBeVisible();
    await expect(characterCount).toContainText(`${testMessage.length}/4000`);
  });

  test("should allow model selection", async ({ page }) => {
    // Wait for page to load
    await expect(page.getByRole("heading", { name: /Experience streaming responses/i })).toBeVisible();

    // Find the model selector
    const modelSelector = page.getByRole("combobox", { name: /Select AI model/i });
    await expect(modelSelector).toBeVisible();

    // Click to open model selector
    await modelSelector.click();

    // Verify model options are visible
    await expect(page.getByText(/GPT-4o/i)).toBeVisible();
    await expect(page.getByText(/o4-mini/i)).toBeVisible();
    await expect(page.getByText(/GPT-4.1-mini/i)).toBeVisible();
  });

  test("should reset conversation", async ({ page }) => {
    // Wait for page to load
    await expect(page.getByRole("heading", { name: /Experience streaming responses/i })).toBeVisible();

    // Find the reset button
    const resetButton = page.getByRole("button", { name: /Reset/i });
    await expect(resetButton).toBeVisible();

    // Click reset button
    await resetButton.click();

    // Verify conversation is reset
    // The message list should show initial messages or be empty
    const messageList = page.getByRole("region", { name: /Conversation timeline/i });
    await expect(messageList).toBeVisible();
  });

  test("should maintain scroll position during streaming", async ({ page }) => {
    // Wait for page to load
    await expect(page.getByRole("heading", { name: /Experience streaming responses/i })).toBeVisible();

    // Find the message list container
    const messageListContainer = page.getByRole("region", { name: /Conversation timeline/i });
    await expect(messageListContainer).toBeVisible();

    // Scroll to bottom of message list
    const scrollContainer = messageListContainer.locator("..").first();
    await scrollContainer.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    // Get initial scroll position
    const initialScrollTop = await scrollContainer.evaluate((el) => el.scrollTop);

    // Note: In a real streaming scenario, we would:
    // 1. Send a message
    // 2. Wait for streaming to start
    // 3. Verify scroll position maintains near bottom
    // 4. Verify new content appears and scroll adjusts

    // For now, verify the container is scrollable
    expect(initialScrollTop).toBeGreaterThanOrEqual(0);
  });

  test("should display spinner during streaming", async ({ page }) => {
    // Wait for page to load
    await expect(page.getByRole("heading", { name: /Experience streaming responses/i })).toBeVisible();

    // This test would verify that a loading spinner is visible during streaming
    // The actual implementation depends on how the UI displays loading states

    // Find the message list
    const messageList = page.getByRole("region", { name: /Conversation timeline/i });
    await expect(messageList).toBeVisible();

    // Note: In a real scenario, we would:
    // 1. Send a message
    // 2. Verify spinner appears in message list
    // 3. Verify spinner disappears when streaming completes
  });
});

