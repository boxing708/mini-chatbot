import { asc, eq } from "drizzle-orm";
import type { UIMessage } from "ai";
import { db } from "./index";
import { chats, messages } from "./schema";

export const LEARNING_CHAT_ID = "learning-chat";

export function loadMessages(chatId: string): UIMessage[] {
  return db
    .select({
      id: messages.id,
      role: messages.role,
      parts: messages.parts,
    })
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(asc(messages.sequence))
    .all();
}

export function saveMessages(chatId: string, nextMessages: UIMessage[]) {
  const now = new Date();

  db.transaction(tx => {
    tx.insert(chats)
      .values({
        id: chatId,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: chats.id,
        set: { updatedAt: now },
      })
      .run();

    tx.delete(messages).where(eq(messages.chatId, chatId)).run();

    if (nextMessages.length === 0) return;

    tx.insert(messages)
      .values(
        nextMessages.map((message, sequence) => ({
          id: message.id,
          chatId,
          sequence,
          role: message.role,
          parts: message.parts,
        })),
      )
      .run();
  });
}
