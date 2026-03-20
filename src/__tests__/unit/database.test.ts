import { describe, expect, it, beforeEach } from "vitest";
import { DatabaseManager } from "../../server/modules/DatabaseManager.js";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("DatabaseManager (JSON)", () => {
  const testDbPath = join(tmpdir(), `test_db_${Date.now()}.json`);

  beforeEach(() => {
    if (existsSync(testDbPath)) rmSync(testDbPath);
  });

  it("should initialize a new database if none exists", () => {
    const manager = new DatabaseManager(testDbPath);
    manager.initialize();
    expect(manager.isInitialized()).toBe(true);
    expect(existsSync(testDbPath)).toBe(true);
  });

  it("should save and retrieve chat history", () => {
    const manager = new DatabaseManager(testDbPath);
    manager.initialize();
    
    const chatId = "test-chat";
    manager.saveChatMessage(chatId, "user", "Hello");
    manager.saveChatMessage(chatId, "assistant", "Hi!");

    const history = manager.getChatHistory(chatId);
    expect(history).toHaveLength(2);
    expect(history[0]?.content).toBe("Hello");
    expect(history[1]?.content).toBe("Hi!");
  });

  it("should persist data to disk", () => {
    const manager1 = new DatabaseManager(testDbPath);
    manager1.initialize();
    manager1.saveChatMessage("chat1", "user", "Persist me");
    manager1.close();

    const manager2 = new DatabaseManager(testDbPath);
    manager2.initialize();
    const history = manager2.getChatHistory("chat1");
    expect(history).toHaveLength(1);
    expect(history[0]?.content).toBe("Persist me");
  });
});
