/**
 * Database utility functions for chat message storage and retrieval
 * (Simplified for JSON storage)
 */
import type { ChatMessage } from "../types/index.js";

export function initializeDatabase(_db: any): void {
  // No-op for JSON storage
}

export function getChatHistory(data: any, chatId: string): ChatMessage[] {
  return data[chatId]?.messages || [];
}

export function saveChatMessage(data: any, chatId: string, message: ChatMessage) {
  if (!data[chatId]) {
    data[chatId] = {
      messages: [],
      created_at: new Date().toISOString()
    };
  }
  data[chatId].messages.push(message);
}
