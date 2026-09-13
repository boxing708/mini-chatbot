"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type ChatStatus, type UIMessage } from "ai";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ChatbotContextValue = {
  messages: UIMessage[];
  status: ChatStatus;
  error: Error | undefined;
  clearError: () => void;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  sendMessage: () => Promise<void>;
  stop: () => Promise<void>;
};

const ChatbotContext = createContext<ChatbotContextValue | null>(null);

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState("");

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const {
    messages,
    status,
    error,
    clearError,
    sendMessage: sendChatMessage,
    stop,
  } = useChat({
    id: "learning-chat",
    transport,
  });

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || status !== "ready") return;

    setInput("");
    await sendChatMessage({ text });
  }, [input, sendChatMessage, status]);

  const value = useMemo<ChatbotContextValue>(
    () => ({
      messages,
      status,
      error,
      clearError,
      input,
      setInput,
      sendMessage,
      stop,
    }),
    [messages, status, error, clearError, input, sendMessage, stop],
  );

  return (
    <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);

  if (context === null) {
    throw new Error("useChatbot must be used within ChatbotProvider");
  }

  return context;
}
