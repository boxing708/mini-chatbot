import type { UIMessage } from "ai";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const chats = sqliteTable("chats", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    chatId: text("chat_id")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(),
    role: text("role").$type<UIMessage["role"]>().notNull(),
    parts: text("parts", { mode: "json" })
      .$type<UIMessage["parts"]>()
      .notNull(),
  },
  table => [
    index("messages_chat_sequence_idx").on(table.chatId, table.sequence),
  ],
);
