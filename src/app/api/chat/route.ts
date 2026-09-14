import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  streamText,
  type UIMessage,
  validateUIMessages,
} from "ai";
import { loadMessages, saveMessages } from "@/db/chat-store";

export const maxDuration = 30;

type ChatRequest = {
  chatId: string;
  message: UIMessage;
};

const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

function createMockResponse(
  chatId: string,
  messages: UIMessage[],
  signal: AbortSignal,
) {
  const answer = "DB対応モックです。この応答が完了するとSQLiteへ保存されます。";

  const stream = createUIMessageStream({
    originalMessages: messages,
    generateId,
    execute: async ({ writer }) => {
      const textPartId = generateId();
      writer.write({ type: "text-start", id: textPartId });

      for (const character of answer) {
        if (signal.aborted) {
          writer.write({ type: "abort" });
          return;
        }

        writer.write({
          type: "text-delta",
          id: textPartId,
          delta: character,
        });
        await sleep(24);
      }

      writer.write({ type: "text-end", id: textPartId });
    },
    onFinish: ({ messages: completedMessages, isAborted }) => {
      if (!isAborted) saveMessages(chatId, completedMessages);
    },
  });

  return createUIMessageStreamResponse({ stream });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ChatRequest>;
  const { chatId, message } = body;

  if (!chatId || !message) {
    return new Response("chatId and message are required", { status: 400 });
  }

  const previousMessages = loadMessages(chatId);
  const messages = await validateUIMessages({
    messages: [...previousMessages, message],
  });

  // AIが失敗・中断してもユーザー発言は残す。
  saveMessages(chatId, messages);

  if (process.env.USE_MOCK_AI === "true") {
    return createMockResponse(chatId, messages, request.signal);
  }

  const model = process.env.AI_MODEL;
  if (!model) {
    return new Response("AI_MODEL is not configured", { status: 500 });
  }

  const result = streamText({
    model,
    system:
      "あなたは簡潔で親切な学習アシスタントです。回答は日本語で返してください。",
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: generateId,
    onFinish: ({ messages: completedMessages, isAborted }) => {
      if (!isAborted) saveMessages(chatId, completedMessages);
    },
  });
}
