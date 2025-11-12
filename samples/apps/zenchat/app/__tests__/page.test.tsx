import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";

import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders the conversation timeline with interactive composer controls", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>,
    );

    const composerForm = screen.getByRole("form", { name: /message composer/i });
    const messageInput = screen.getByRole("textbox", {
      name: /message prompt/i,
    });
    const modelSelect = screen.getByRole("combobox", {
      name: /select ai model/i,
    });
    const sendButton = screen.getByRole("button", {
      name: /send message/i,
    });
    const messageList = screen.getByTestId("message-list");
    const conversationRegion = messageList.closest('[role="region"]');
    const previewMessages = within(messageList).getAllByRole("article");
    const reasoningTrigger = screen.getAllByRole("button", { name: /reasoning/i })[0];

    expect(conversationRegion).not.toBeNull();
    expect(conversationRegion as HTMLElement).toHaveAttribute("aria-live", "polite");

    expect(composerForm).toBeInTheDocument();
    expect(messageInput).toBeEnabled();
    expect(modelSelect).toHaveTextContent("GPT-4o");
    expect(sendButton).toBeEnabled();

    expect(previewMessages).toHaveLength(4);
    expect(reasoningTrigger).toBeInTheDocument();
  });
});

