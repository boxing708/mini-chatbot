import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  streamText,
  type UIMessage,
} from "ai";

export const maxDuration = 30;

const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

function createMockResponse(messages: UIMessage[], signal: AbortSignal) {
  const answer =
    "モックモードです。USE_MOCK_AI=false にすると実際のモデルへ接続します。";

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
  });

  return createUIMessageStreamResponse({ stream });
}

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  if (process.env.USE_MOCK_AI === "true") {
    return createMockResponse(messages, request.signal);
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
  });
}
