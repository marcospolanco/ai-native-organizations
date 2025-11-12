import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InputComposer } from "@/components/ai-elements/input-composer";

describe("InputComposer", () => {
  it("renders with GPT-4o selected by default", () => {
    render(<InputComposer />);

    const trigger = screen.getByRole("combobox", { name: /select ai model/i });

    expect(trigger).toHaveTextContent("GPT-4o");
  });

  it("blocks submission when message is empty", async () => {
    const user = userEvent.setup();

    render(<InputComposer />);

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      await screen.findByText("Message cannot be empty."),
    ).toBeInTheDocument();
  });

  it("submits trimmed message with selected model", async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn().mockResolvedValue(undefined);

    render(<InputComposer onSubmit={handleSubmit} />);

    const textarea = screen.getByLabelText("Message prompt");
    await user.type(textarea, "   Hello world   ");

    const trigger = screen.getByRole("combobox", { name: /select ai model/i });
    await user.click(trigger);
    const option = await screen.findByRole("option", { name: "o4-mini" });
    await user.click(option);

    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        message: "Hello world",
        model: "o4-mini",
      });
    });

    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
  });
});

