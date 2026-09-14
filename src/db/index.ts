import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const sqlite = new Database("sqlite.db");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite);
