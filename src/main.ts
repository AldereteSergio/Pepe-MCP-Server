#!/usr/bin/env node
import { existsSync, mkdirSync } from "node:fs";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CONFIG } from "./server/config.js";
import { initializeBrowser } from "./utils/puppeteer.js";
import type { PuppeteerContext } from "./types/index.js";
import { PerplexityServer } from "./server/PerplexityServer.js";

const PERPLEXITY_URL = "https://www.perplexity.ai";

/** Replace persistent profile with a fresh Chrome profile from login, keeping chat_history.json if present. */
async function promoteLoginProfile(fromTempDir: string, targetDir: string): Promise<void> {
    const chatName = "chat_history.json";
    const chatPath = join(targetDir, chatName);
    let chatBackup: Buffer | null = null;
    if (existsSync(chatPath)) {
        chatBackup = await readFile(chatPath);
    }
    await rm(targetDir, { recursive: true, force: true });
    await cp(fromTempDir, targetDir, { recursive: true });
    if (chatBackup) {
        await writeFile(join(targetDir, chatName), chatBackup);
    }
    await rm(fromTempDir, { recursive: true, force: true });
}

async function runLogin() {
    console.log("🔐 Perplexity Pro Account Login\n");

    const profileDir = CONFIG.BROWSER_DATA_DIR;
    if (!existsSync(profileDir)) {
        mkdirSync(profileDir, { recursive: true });
        console.log(`📁 Created profile directory: ${profileDir}`);
    }

    const loginTempDir = await mkdtemp(join(tmpdir(), "pepe-login-"));
    let loginPromoted = false;
    console.log(`📂 Session will be saved to: ${profileDir}`);
    console.log(`🔓 Using isolated login profile (avoids conflict if Pepe MCP is running): ${loginTempDir}\n`);
    console.log("🌐 Opening browser (Headless: FALSE)...\n");

    const mockCtx: PuppeteerContext = {
        browser: null,
        page: null,
        isInitializing: false,
        searchInputSelector: '[role="textbox"]',
        lastSearchTime: 0,
        idleTimeout: null,
        operationCount: 0,
        log: () => {},
        setBrowser: (b) => { mockCtx.browser = b as any; },
        setPage: (p) => { mockCtx.page = p as any; },
        setIsInitializing: (i) => { mockCtx.isInitializing = i; },
        setSearchInputSelector: (s) => { mockCtx.searchInputSelector = s; },
        setIdleTimeout: (t) => { mockCtx.idleTimeout = t; },
        incrementOperationCount: () => ++mockCtx.operationCount,
        determineRecoveryLevel: () => 1,
        IDLE_TIMEOUT_MS: 0
    };

    try {
        await initializeBrowser(mockCtx, false, { userDataDirOverride: loginTempDir });

        if (!mockCtx.page) throw new Error("Failed to open browser page");

        console.log("📍 Navigating to Perplexity...");
        try {
            await (mockCtx.page as any).goto(PERPLEXITY_URL, {
                waitUntil: "domcontentloaded",
                timeout: CONFIG.PAGE_TIMEOUT,
            });
            console.log("✅ Navigation successful!\n");
        } catch {
            console.log("⚠️  Navigation issue, but browser is open. Proceed manually.\n");
        }

        console.log("═══════════════════════════════════════════════════════════════");
        console.log("║   1. Log into your Perplexity Pro account                   ║");
        console.log("║   2. Once logged in, CLOSE the browser window               ║");
        console.log("║   3. Your session will be saved in your HOME folder         ║");
        console.log("═══════════════════════════════════════════════════════════════\n");

        await new Promise<void>((resolve) => {
            (mockCtx.browser as any)?.on("disconnected", () => resolve());
        });

        try {
            await promoteLoginProfile(loginTempDir, profileDir);
            loginPromoted = true;
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error(
                `\n⚠️  Could not copy login profile to ${profileDir}: ${msg}
    Close Pepe MCP / other Chrome using that folder and run: npm run login
`,
            );
            throw e;
        }

        console.log("\n✅ Login session saved successfully!");
    } finally {
        if (!loginPromoted && existsSync(loginTempDir)) {
            await rm(loginTempDir, { recursive: true, force: true }).catch(() => {});
        }
    }
}

async function main() {
    const args = process.argv.slice(2);
    if (args.includes("login")) {
        await runLogin();
        process.exit(0);
    }

    const server = new PerplexityServer();
    await server.run();
}

main().catch((error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
});
