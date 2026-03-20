import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
/**
 * DatabaseManager - Handles all database operations
 * Focused, testable module for SQLite database management
 */
import Database from "better-sqlite3";
import { getChatHistory, initializeDatabase, saveChatMessage } from "../../utils/db.js";
import { logError, logInfo } from "../../utils/logging.js";
export class DatabaseManager {
    customDbPath;
    db = null;
    initialized = false;
    constructor(customDbPath) {
        this.customDbPath = customDbPath;
    }
    initialize() {
        try {
            // Determine database path
            const dbPath = this.customDbPath ||
                join(dirname(fileURLToPath(import.meta.url)), "..", "..", "chat_history.db");
            const dbDir = dirname(dbPath);
            logInfo(`Initializing database at: ${dbPath}`);
            // Create directory if it doesn't exist
            if (!existsSync(dbDir)) {
                mkdirSync(dbDir, { recursive: true });
                logInfo(`Created database directory: ${dbDir}`);
            }
            // Initialize SQLite database
            this.db = new Database(dbPath);
            // Run database initialization script
            initializeDatabase(this.db);
            this.initialized = true;
            logInfo("DatabaseManager initialized successfully");
        }
        catch (error) {
            logError("DatabaseManager initialization failed:", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    getChatHistory(chatId) {
        if (!this.isInitialized()) {
            throw new Error("Database not initialized");
        }
        if (!chatId) {
            throw new Error("Chat ID is required");
        }
        try {
            return getChatHistory(this.db, chatId);
        }
        catch (error) {
            logError("Failed to get chat history:", {
                error: error instanceof Error ? error.message : String(error),
                chatId,
            });
            throw error;
        }
    }
    saveChatMessage(chatId, role, content) {
        if (!this.isInitialized()) {
            throw new Error("Database not initialized");
        }
        try {
            const message = { role, content };
            saveChatMessage(this.db, chatId, message);
            logInfo(`Saved ${role} message for chat ${chatId}`);
        }
        catch (error) {
            logError("Failed to save chat message:", {
                error: error instanceof Error ? error.message : String(error),
                chatId,
                role,
            });
            throw error;
        }
    }
    close() {
        try {
            if (this.db) {
                this.db.close();
                this.db = null;
                this.initialized = false;
                logInfo("Database connection closed successfully");
            }
        }
        catch (error) {
            logError("Error closing database:", {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    isInitialized() {
        return this.initialized && this.db !== null;
    }
    // Getter for testing purposes
    getDatabase() {
        return this.db;
    }
}
