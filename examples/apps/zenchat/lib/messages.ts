export type MessageRole = "user" | "assistant";

export type MessageSource = {
  label: string;
  href: string;
};

export type Message = {
  id: string;
  role: MessageRole;
  authorLabel: string;
  body: string;
  meta?: string;
  reasoning?: string;
  sources?: MessageSource[];
};

export const previewMessages: Message[] = [
  {
    id: "user-1",
    role: "user",
    authorLabel: "You",
    body: "How can I create a calm AI chat workspace that stays focused on thoughtful conversations?",
  },
  {
    id: "assistant-1",
    role: "assistant",
    authorLabel: "Zen Chat",
    body: "Start with a responsive layout that balances breathing room with clarity. Anchor the conversation canvas in the center, and make sure theming adjusts gracefully between light and dark.",
    meta: "Design guidance • Updated moments ago",
    reasoning:
      "Lead with structure: set grid constraints, reinforce vertical rhythm with consistent spacing, and keep interactive elements comfortably separated.",
    sources: [
      {
        label: "Zen Chat design system",
        href: "#design-system",
      },
      {
        label: "Next.js theming best practices",
        href: "#nextjs-theming",
      },
    ],
  },
  {
    id: "user-2",
    role: "user",
    authorLabel: "You",
    body: "Can we preview a conversation before wiring up the streaming API?",
  },
  {
    id: "assistant-2",
    role: "assistant",
    authorLabel: "Zen Chat",
    body: "Absolutely. Placeholder messages help validate spacing, typography, and accessibility before live data arrives. Use richly-typed message objects so streaming can drop in later without rewriting the layout.",
    reasoning:
      "Prototype the rendering pipeline with static messages, then swap in the server action once the streaming endpoint is ready. This keeps layout and data concerns decoupled.",
    sources: [
      {
        label: "Phase 2 plan",
        href: "#phase-2-plan",
      },
    ],
  },
];

