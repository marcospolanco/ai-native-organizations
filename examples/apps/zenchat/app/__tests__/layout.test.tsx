import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

import RootLayout from "@/app/layout";

describe("RootLayout", () => {
  it("renders the Zen Chat header", () => {
    const layout = RootLayout({
      children: <div data-testid="content">Hello world</div>,
    });

    let headingFound = false;

    const visit = (node: unknown) => {
      if (!isValidElement(node)) {
        return;
      }

      const element = node as ReactElement<{ children?: ReactNode }>;
      const { children } = element.props;

      if (
        element.type === "h1" &&
        typeof children === "string" &&
        children.includes("Zen Chat")
      ) {
        headingFound = true;
        return;
      }

      Children.forEach(children, visit);
    };

    visit(layout);

    expect(headingFound).toBe(true);
  });
});
