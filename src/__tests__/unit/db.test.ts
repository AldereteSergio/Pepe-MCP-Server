import { describe, expect, it } from "vitest";
import * as dbModule from "../../utils/db.js";

describe("Database Utilities (JSON)", () => {
  it("should retrieve chat history from data object", () => {
    const data = {
      "chat1": {
        messages: [{ role: "user", content: "Hi" }],
        created_at: "2026-03-20"
      }
    };
    const history = dbModule.getChatHistory(data, "chat1");
    expect(history).toHaveLength(1);
    expect(history[0]?.content).toBe("Hi");
  });

  it("should save chat message to data object", () => {
    const data: any = {};
    dbModule.saveChatMessage(data, "chat2", { role: "assistant", content: "Hello" });
    expect(data["chat2"]).toBeDefined();
    expect(data["chat2"].messages).toHaveLength(1);
    expect(data["chat2"].messages[0].content).toBe("Hello");
  });
});
