import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  type UIMessage,
} from "ai";

const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  console.log(JSON.stringify(messages, null, 2));

  const latestText = messages
    .at(-1)
    ?.parts.filter(part => part.type === "text")
    .map(part => part.text)
    .join("");

  const answer =
    `「${latestText ?? ""}」を受け取りました。` +
    "これはAIを呼ばずに返しているストリーミングモックです。";

  const stream = createUIMessageStream({
    originalMessages: messages,
    generateId,
    execute: async ({ writer }) => {
      const textPartId = generateId();
      writer.write({ type: "text-start", id: textPartId });

      for (const character of answer) {
        if (request.signal.aborted) {
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
