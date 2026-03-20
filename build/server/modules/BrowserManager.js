import { logError, logInfo, logWarn } from "../../utils/logging.js";
import { checkForCaptcha, initializeBrowser, navigateToPerplexity, recoveryProcedure, resetIdleTimeout, waitForSearchInput, } from "../../utils/puppeteer.js";
export class BrowserManager {
    browser = null;
    page = null;
    isInitializing = false;
    searchInputSelector = 'textarea[placeholder*="Ask"]';
    lastSearchTime = 0;
    idleTimeout = null;
    operationCount = 0;
    IDLE_TIMEOUT_MS = 5 * 60 * 1000;
    getPuppeteerContext() {
        return {
            browser: this.browser,
            page: this.page,
            isInitializing: this.isInitializing,
            searchInputSelector: this.searchInputSelector,
            lastSearchTime: this.lastSearchTime,
            idleTimeout: this.idleTimeout,
            operationCount: this.operationCount,
            log: this.log.bind(this),
            setBrowser: (browser) => {
                this.browser = browser;
            },
            setPage: (page) => {
                this.page = page;
            },
            setIsInitializing: (val) => {
                this.isInitializing = val;
            },
            setSearchInputSelector: (selector) => {
                this.searchInputSelector = selector;
            },
            setIdleTimeout: (timeout) => {
                this.idleTimeout = timeout;
            },
            incrementOperationCount: () => ++this.operationCount,
            determineRecoveryLevel: this.determineRecoveryLevel.bind(this),
            IDLE_TIMEOUT_MS: this.IDLE_TIMEOUT_MS,
        };
    }
    log(level, message) {
        switch (level) {
            case "info":
                logInfo(message);
                break;
            case "warn":
                logWarn(message);
                break;
            case "error":
                logError(message);
                break;
            default:
                logInfo(message);
        }
    }
    determineRecoveryLevel(error) {
        if (!error)
            return 1;
        const errorMessage = error.message.toLowerCase();
        // Level 3: Critical errors requiring full browser restart
        if (errorMessage.includes("detached") ||
            errorMessage.includes("crashed") ||
            errorMessage.includes("disconnected") ||
            errorMessage.includes("protocol error")) {
            return 3;
        }
        // Level 2: Navigation/page errors requiring page restart
        if (errorMessage.includes("navigation") ||
            errorMessage.includes("timeout") ||
            errorMessage.includes("net::err")) {
            return 2;
        }
        // Level 1: Minor errors requiring simple recovery
        return 1;
    }
    async initialize() {
        if (this.isInitializing) {
            logInfo("Browser initialization already in progress...");
            return;
        }
        try {
            const ctx = this.getPuppeteerContext();
            await initializeBrowser(ctx);
            logInfo("BrowserManager initialized successfully");
        }
        catch (error) {
            logError("BrowserManager initialization failed:", {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
    async navigateToPerplexity() {
        const ctx = this.getPuppeteerContext();
        await navigateToPerplexity(ctx);
    }
    async waitForSearchInput() {
        const ctx = this.getPuppeteerContext();
        const selector = await waitForSearchInput(ctx);
        return selector;
    }
    async checkForCaptcha() {
        const ctx = this.getPuppeteerContext();
        return await checkForCaptcha(ctx);
    }
    async performRecovery(error) {
        const ctx = this.getPuppeteerContext();
        await recoveryProcedure(ctx, error);
    }
    isReady() {
        return !!(this.browser && this.page && !this.page.isClosed() && !this.isInitializing);
    }
    async cleanup() {
        try {
            if (this.idleTimeout) {
                clearTimeout(this.idleTimeout);
                this.idleTimeout = null;
            }
            if (this.page && !this.page.isClosed()) {
                await this.page.close();
            }
            if (this.browser?.isConnected()) {
                await this.browser.close();
            }
            this.page = null;
            this.browser = null;
            this.isInitializing = false;
            logInfo("BrowserManager cleanup completed");
        }
        catch (error) {
            logError("Error during BrowserManager cleanup:", {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    getPage() {
        return this.page;
    }
    getBrowser() {
        return this.browser;
    }
    resetIdleTimeout() {
        const ctx = this.getPuppeteerContext();
        resetIdleTimeout(ctx);
    }
}
