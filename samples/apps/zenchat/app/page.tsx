import { ChatSession } from "@/components/ai-elements/chat-session";

export default function HomePage() {
  return (
    <section className="flex min-h-128 flex-col gap-8">
      <ChatSession />
    </section>
  );
}
