import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Message, MessageSource } from "@/lib/messages";
import type { ChatModelId } from "@/lib/validation";

export type ChatMessageUpdate = {
  [Key in keyof Omit<Message, "id">]?: Omit<Message, "id">[Key] | undefined;
};

type MessageUpdate = ChatMessageUpdate;

function cloneMessage(message: Message): Message {
  const cloned: Message = {
    id: message.id,
    role: message.role,
    authorLabel: message.authorLabel,
    body: message.body,
  };

  if (message.meta !== undefined) {
    cloned.meta = message.meta;
  }

  if (message.reasoning !== undefined) {
    cloned.reasoning = message.reasoning;
  }

  if (message.sources) {
    cloned.sources = message.sources.map((source) => ({ ...source }));
  }

  return cloned;
}

function cloneSources(sources?: MessageSource[]): MessageSource[] | undefined {
  return sources ? sources.map((source) => ({ ...source })) : undefined;
}

type ChatStoreState = {
  messages: Message[];
  selectedModel: ChatModelId;
  appendMessage: (message: Message) => void;
  updateMessage: (id: string, update: MessageUpdate) => void;
  setModel: (model: ChatModelId) => void;
  reset: (messages?: Message[]) => void;
};

const createInitialState = (): Omit<ChatStoreState, "appendMessage" | "updateMessage" | "setModel" | "reset"> => ({
  messages: [],
  selectedModel: "gpt-4o",
});

export const useChatStore = create<ChatStoreState>()(
  persist(
    (set) => ({
      ...createInitialState(),
      appendMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, cloneMessage(message)],
        })),
      updateMessage: (id, update) =>
        set((state) => ({
          messages: state.messages.map((message) => {
            if (message.id !== id) {
              return message;
            }

            const nextMessage: Message = cloneMessage(message);

            if (update.role !== undefined) {
              nextMessage.role = update.role;
            }

            if (update.authorLabel !== undefined) {
              nextMessage.authorLabel = update.authorLabel;
            }

            if (update.body !== undefined) {
              nextMessage.body = update.body;
            }

            if ("meta" in update) {
              if (update.meta === undefined) {
                delete nextMessage.meta;
              } else {
                nextMessage.meta = update.meta;
              }
            }

            if ("reasoning" in update) {
              if (update.reasoning === undefined) {
                delete nextMessage.reasoning;
              } else {
                nextMessage.reasoning = update.reasoning;
              }
            }

            if ("sources" in update) {
              if (update.sources === undefined) {
                delete nextMessage.sources;
              } else {
                nextMessage.sources = cloneSources(update.sources)!;
              }
            }

            return nextMessage;
          }),
        })),
      setModel: (selectedModel) =>
        set(() => ({
          selectedModel,
        })),
      reset: (messages = []) =>
        set(() => ({
          ...createInitialState(),
          messages: messages.map((message) => cloneMessage(message)),
        })),
    }),
    {
      name: "zenchat-store",
      partialize: (state) => ({
        selectedModel: state.selectedModel,
      }),
    },
  ),
);


