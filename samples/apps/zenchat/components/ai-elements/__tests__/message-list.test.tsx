import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MessageList } from "@/components/ai-elements/message-list";
import { previewMessages } from "@/lib/messages";

describe("MessageList", () => {
  it("renders user and assistant messages with alignment classes", () => {
    render(<MessageList messages={previewMessages} />);

    const userMessage = screen.getByTestId("message-item-user-1");
    const assistantMessage = screen.getByTestId("message-item-assistant-1");

    expect(userMessage).toHaveAttribute("data-role", "user");
    expect(userMessage).toHaveClass("justify-end");

    expect(assistantMessage).toHaveAttribute("data-role", "assistant");
    expect(assistantMessage).toHaveClass("justify-start");
  });

  it("reveals reasoning details when the accordion trigger is activated", async () => {
    render(<MessageList messages={previewMessages} />);
    const user = userEvent.setup();

    const assistantWithReasoning = screen.getByTestId("message-item-assistant-1");
    const reasoningTrigger = within(assistantWithReasoning).getByRole("button", {
      name: /reasoning/i,
    });

    await user.click(reasoningTrigger);

    expect(
      within(assistantWithReasoning).getByText(/Lead with structure/i),
    ).toBeVisible();
  });

  it("shows an empty state when no messages are provided", () => {
    render(<MessageList messages={[]} />);

    expect(
      screen.getByText(/No messages yet\. Start the conversation/i),
    ).toBeInTheDocument();
  });

  it("lists source links when provided", async () => {
    render(<MessageList messages={previewMessages} />);
    const user = userEvent.setup();

    const assistantWithSources = screen.getByTestId("message-item-assistant-2");
    const sourcesTrigger = within(assistantWithSources).getByRole("button", {
      name: /sources/i,
    });

    await user.click(sourcesTrigger);

    const sourceLinks = within(assistantWithSources).getAllByRole("link");
    expect(sourceLinks.length).toBeGreaterThanOrEqual(1);
  });
});

