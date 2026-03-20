import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { ChatMessage, IDatabaseManager } from "../../types/index.js";
import { logError, logInfo } from "../../utils/logging.js";
import { CONFIG } from "../config.js";

/**
 * DatabaseManager - Handles all database operations using a JSON file
 * 100% Portable, no native dependencies, perfect for npx distribution.
 */
export class DatabaseManager implements IDatabaseManager {
  private data: Record<string, { messages: ChatMessage[], created_at: string }> = {};
  private initialized = false;

  constructor(private readonly customDbPath?: string) {}

  initialize(): void {
    try {
      const dbPath = this.customDbPath || CONFIG.DB_PATH.replace(".db", ".json");
      const dbDir = dirname(dbPath);

      logInfo(`Initializing JSON database at: ${dbPath}`);

      if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true });
      }

      if (existsSync(dbPath)) {
        const content = readFileSync(dbPath, "utf-8");
        this.data = JSON.parse(content);
      } else {
        this.data = {};
        this.saveToDisk();
      }

      this.initialized = true;
      logInfo("DatabaseManager (JSON) initialized successfully");
    } catch (error) {
      logError("DatabaseManager initialization failed:", {
        error: error instanceof Error ? error.message : String(error),
      });
      // Fallback to in-memory if disk fails
      this.data = {};
      this.initialized = true;
    }
  }

  private saveToDisk(): void {
    try {
      const dbPath = this.customDbPath || CONFIG.DB_PATH.replace(".db", ".json");
      writeFileSync(dbPath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (error) {
      logError("Failed to save database to disk:", { error });
    }
  }

  getChatHistory(chatId?: string): ChatMessage[] {
    if (!chatId) throw new Error("Chat ID is required");
    return this.data[chatId]?.messages || [];
  }

  saveChatMessage(chatId: string, role: "user" | "assistant", content: string): void {
    if (!this.data[chatId]) {
      this.data[chatId] = {
        messages: [],
        created_at: new Date().toISOString()
      };
    }

    this.data[chatId].messages.push({ role, content });
    this.saveToDisk();
    logInfo(`Saved ${role} message for chat ${chatId}`);
  }

  close(): void {
    this.saveToDisk();
    this.initialized = false;
    logInfo("Database connection (JSON) closed");
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getDatabase(): any {
    return this.data;
  }
}
