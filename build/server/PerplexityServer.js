/**
 * PerplexityServer - Modular, testable architecture
 * Uses dependency injection and focused modules for better testability
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { logError, logInfo } from "../utils/logging.js";
import { BrowserManager } from "./modules/BrowserManager.js";
import { DatabaseManager } from "./modules/DatabaseManager.js";
import { SearchEngine } from "./modules/SearchEngine.js";
import { createToolHandlersRegistry, setupToolHandlers } from "./toolHandlerSetup.js";
// Import modular tool implementations
import chatPerplexity from "../tools/chatPerplexity.js";
import extractUrlContent from "../tools/extractUrlContent.js";
import search from "../tools/search.js";
import deepResearch from "../tools/deepResearch.js";
import listAvailableModels from "../tools/listAvailableModels.js";
import getDocumentation from "../tools/getDocumentation.js";
import findApis from "../tools/findApis.js";
import checkDeprecatedCode from "../tools/checkDeprecatedCode.js";
export class PerplexityServer {
    server;
    browserManager;
    searchEngine;
    databaseManager;
    constructor(dependencies) {
        try {
            // Initialize MCP Server
            this.server = new Server({ name: "perplexity-server", version: "0.2.0" }, {
                capabilities: {
                    tools: {
                        listChanged: true,
                    },
                },
            });
            // Initialize modules with dependency injection
            this.databaseManager = dependencies?.databaseManager ?? new DatabaseManager();
            this.browserManager = dependencies?.browserManager ?? new BrowserManager();
            this.searchEngine = dependencies?.searchEngine ?? new SearchEngine(this.browserManager);
            // Initialize database
            this.databaseManager.initialize();
            // Setup tool handlers
            this.setupToolHandlers();
            // Setup graceful shutdown (only if not in MCP mode and not in test mode)
            // biome-ignore lint/complexity/useLiteralKeys: Environment variable access
            if (!process.env["MCP_MODE"] && !process.env["VITEST"]) {
                this.setupShutdownHandler();
            }
            logInfo("PerplexityServer initialized successfully");
        }
        catch (error) {
            logError("Error in PerplexityServer constructor:", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    setupShutdownHandler() {
        process.on("SIGINT", async () => {
            logInfo("SIGINT received, shutting down gracefully...");
            try {
                await this.cleanup();
                await this.server.close();
                process.exit(0);
            }
            catch (error) {
                logError("Error during shutdown:", {
                    error: error instanceof Error ? error.message : String(error),
                });
                process.exit(1);
            }
        });
    }
    async cleanup() {
        try {
            await this.browserManager.cleanup();
            this.databaseManager.close();
            logInfo("Server cleanup completed");
        }
        catch (error) {
            logError("Error during cleanup:", {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    // Tool handler implementations
    async handleChatPerplexity(args) {
        const typedArgs = args;
        // Use modular search engine
        const searchResult = await this.searchEngine.performSearch(typedArgs.message, typedArgs.model, typedArgs.attachments);
        // Use modular database manager
        const getChatHistoryFn = (chatId) => this.databaseManager.getChatHistory(chatId);
        const saveChatMessageFn = (chatId, message) => this.databaseManager.saveChatMessage(chatId, message.role, message.content);
        // Call the original tool implementation with injected dependencies
        return await chatPerplexity(typedArgs, {}, // Context not needed with modular approach
        (prompt, _ctx, model, attachments) => this.searchEngine.performSearch(prompt, model, attachments), getChatHistoryFn, saveChatMessageFn);
    }
    async handleGetDocumentation(args) {
        const typedArgs = args;
        const ctx = this.createPuppeteerContext();
        return await getDocumentation(typedArgs, ctx, (prompt, _ctx) => this.searchEngine.performSearch(prompt));
    }
    async handleFindApis(args) {
        const typedArgs = args;
        const ctx = this.createPuppeteerContext();
        return await findApis(typedArgs, ctx, (prompt, _ctx) => this.searchEngine.performSearch(prompt));
    }
    async handleCheckDeprecatedCode(args) {
        const typedArgs = args;
        const ctx = this.createPuppeteerContext();
        return await checkDeprecatedCode(typedArgs, ctx, (prompt, _ctx) => this.searchEngine.performSearch(prompt));
    }
    async handleSearch(args) {
        const typedArgs = args;
        const ctx = this.createPuppeteerContext();
        const result = await search(typedArgs, ctx, (prompt, _ctx, model, attachments) => this.searchEngine.performSearch(prompt, model, attachments));
        return typeof result === "string" ? result : "Streaming is handled via transport";
    }
    async handleDeepResearch(args) {
        const typedArgs = args;
        const ctx = this.createPuppeteerContext();
        return await deepResearch(typedArgs, ctx, (query, attachments) => this.searchEngine.performDeepResearch(query, attachments));
    }
    async handleListAvailableModels(_args) {
        return await listAvailableModels({}, () => this.searchEngine.listAvailableModels());
    }
    async handleExtractUrlContent(args) {
        const typedArgs = args;
        // Ensure browser is initialized
        if (!this.browserManager.isReady()) {
            await this.browserManager.initialize();
        }
        // Create PuppeteerContext from BrowserManager
        const ctx = this.createPuppeteerContext();
        return await extractUrlContent(typedArgs, ctx);
    }
    createPuppeteerContext() {
        const browserManager = this.browserManager; // Access the getPuppeteerContext method
        return browserManager.getPuppeteerContext();
    }
    setupToolHandlers() {
        const toolHandlers = createToolHandlersRegistry({
            chat_perplexity: this.handleChatPerplexity.bind(this),
            get_documentation: this.handleGetDocumentation.bind(this),
            find_apis: this.handleFindApis.bind(this),
            check_deprecated_code: this.handleCheckDeprecatedCode.bind(this),
            search: this.handleSearch.bind(this),
            extract_url_content: this.handleExtractUrlContent.bind(this),
            list_available_models: this.handleListAvailableModels.bind(this),
            deep_research: this.handleDeepResearch.bind(this),
        });
        setupToolHandlers(this.server, toolHandlers);
    }
    async run() {
        try {
            logInfo("Creating StdioServerTransport...");
            const transport = new StdioServerTransport();
            logInfo("Starting PerplexityServer...");
            logInfo(`Tools registered: ${Object.keys(this.getToolHandlersRegistry()).join(", ")}`);
            logInfo("Attempting to connect server to transport...");
            await this.server.connect(transport);
            logInfo("PerplexityServer connected and ready");
            logInfo("Server is listening for requests...");
            // Keep the process alive
            process.stdin.resume();
        }
        catch (error) {
            logError("Failed to start server:", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            process.exit(1);
        }
    }
    getToolHandlersRegistry() {
        return {
            chat_perplexity: this.handleChatPerplexity.bind(this),
            get_documentation: this.handleGetDocumentation.bind(this),
            find_apis: this.handleFindApis.bind(this),
            check_deprecated_code: this.handleCheckDeprecatedCode.bind(this),
            search: this.handleSearch.bind(this),
            extract_url_content: this.handleExtractUrlContent.bind(this),
        };
    }
    // Getters for testing
    getBrowserManager() {
        return this.browserManager;
    }
    getSearchEngine() {
        return this.searchEngine;
    }
    getDatabaseManager() {
        return this.databaseManager;
    }
}
