import { Chat } from "@/components/chat";
import { ChatbotProvider } from "@/components/chatbot-provider";
import { LEARNING_CHAT_ID, loadMessages } from "@/db/chat-store";
import { connection } from "next/server";

export default async function Home() {
  await connection();
  const initialMessages = loadMessages(LEARNING_CHAT_ID);

  return (
    <main className='grid min-h-screen place-items-center bg-[#090b10] p-4'>
      <ChatbotProvider
        chatId={LEARNING_CHAT_ID}
        initialMessages={initialMessages}
      >
        <Chat />
      </ChatbotProvider>
    </main>
  );
}
