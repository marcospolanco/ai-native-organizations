import { ChatSession } from "@/components/ai-elements/chat-session";

export default function HomePage() {
  return (
    <section
      aria-labelledby="conversation-heading"
      className="flex min-h-128 flex-col gap-8"
    >
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Phase 5 · Streaming Chat Integration
        </p>
        <h1
          id="conversation-heading"
          className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Experience streaming responses with model-aware messaging
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
          The chat canvas now connects to the streaming server action and TanStack Query powered
          mutation, so messages append in real time as model output arrives.
        </p>
      </header>

      <ChatSession />
    </section>
  );
}
