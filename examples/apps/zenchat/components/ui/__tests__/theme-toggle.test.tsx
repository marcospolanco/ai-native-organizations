import { render, screen } from "@testing-library/react";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";

describe("ThemeToggle", () => {
  it("renders an accessible button after mounting", async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const toggle = await screen.findByRole("button", {
      name: /toggle color scheme/i,
    });

    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute("type", "button");
  });
});

