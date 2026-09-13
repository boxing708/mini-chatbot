import { Chat } from "@/components/chat";
import { ChatbotProvider } from "@/components/chatbot-provider";

export default function Home() {
  return (
    <main className='grid min-h-screen place-items-center bg-[#090b10] p-4'>
      <ChatbotProvider>
        <Chat />
      </ChatbotProvider>
    </main>
  );
}
