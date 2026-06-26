#!/usr/bin/env node
import { execFile } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import { CONFIG } from "./server/config.js";
import { initializeBrowser } from "./utils/puppeteer.js";
import type { PuppeteerContext } from "./types/index.js";
import { PerplexityServer } from "./server/PerplexityServer.js";

const PERPLEXITY_URL = "https://www.perplexity.ai";
const PROFILE_PROMOTION_MAX_ATTEMPTS = 4;
/** Chrome lock/socket files — removed or broken when the browser closes; safe to skip when promoting profile. */
const CHROME_PROFILE_SKIP_NAMES = new Set([
    "lockfile",
    "SingletonLock",
    "SingletonCookie",
    "SingletonSocket",
]);
const CHAT_HISTORY_FILENAME = "chat_history.json";
const execFileAsync = promisify(execFile);
/** Env var used to pass profile paths into PowerShell without embedding user data in the script. */
const PEPE_PROFILE_PATH_ENV = "PEPE_PROFILE_PATH";

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isProfileLockError(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;
    const err = error as NodeJS.ErrnoException;
    return (
        err.code === "EBUSY" ||
        err.code === "EPERM" ||
        err.code === "EACCES" ||
        err.code === "ENOENT"
    );
}

function shouldCopyProfileEntry(sourcePath: string): boolean {
    return !CHROME_PROFILE_SKIP_NAMES.has(basename(sourcePath));
}

async function findWindowsProcessesUsingPath(path: string): Promise<number[]> {
    const command = [
        "$ErrorActionPreference = 'SilentlyContinue'",
        `$profilePath = $env:${PEPE_PROFILE_PATH_ENV}`,
        "if (-not $profilePath) { exit 1 }",
        "Get-CimInstance Win32_Process",
        "| Where-Object { $_.CommandLine -and $_.CommandLine.Contains($profilePath) }",
        "| ForEach-Object { $_.ProcessId }",
    ].join("; ");
    try {
        const { stdout } = await execFileAsync(
            "powershell.exe",
            ["-NoProfile", "-Command", command],
            {
                windowsHide: true,
                encoding: "utf8",
                env: { ...process.env, [PEPE_PROFILE_PATH_ENV]: path },
            },
        );
        return stdout
            .split(/\r?\n/)
            .map((line) => Number.parseInt(line.trim(), 10))
            .filter((pid) => Number.isInteger(pid) && pid > 0 && pid !== process.pid);
    } catch {
        return [];
    }
}

async function forceCloseWindowsProcessesUsingPath(path: string): Promise<number> {
    if (process.platform !== "win32") return 0;
    const pids = [...new Set(await findWindowsProcessesUsingPath(path))];
    if (pids.length === 0) return 0;

    const taskKillArgs = ["/T", "/F", ...pids.flatMap((pid) => ["/PID", String(pid)])];
    try {
        await execFileAsync("taskkill", taskKillArgs, { windowsHide: true, encoding: "utf8" });
    } catch {
        // Some PIDs may already be closed by the time taskkill runs.
    }

    return pids.length;
}

async function readChatHistoryBackup(targetDir: string): Promise<Buffer | null> {
    const chatPath = join(targetDir, CHAT_HISTORY_FILENAME);
    if (!existsSync(chatPath)) {
        return null;
    }
    return readFile(chatPath);
}

/** Replace persistent profile with a fresh Chrome profile from login, keeping chat_history.json if present. */
async function promoteLoginProfile(
    fromTempDir: string,
    targetDir: string,
    chatBackup: Buffer | null,
): Promise<void> {
    await rm(targetDir, { recursive: true, force: true });
    await cp(fromTempDir, targetDir, {
        recursive: true,
        filter: (source) => shouldCopyProfileEntry(source),
    });
    if (chatBackup) {
        await writeFile(join(targetDir, CHAT_HISTORY_FILENAME), chatBackup);
    }
}

async function promoteLoginProfileWithRetry(fromTempDir: string, targetDir: string): Promise<void> {
    const chatBackup = await readChatHistoryBackup(targetDir);
    for (let attempt = 1; attempt <= PROFILE_PROMOTION_MAX_ATTEMPTS; attempt++) {
        try {
            await promoteLoginProfile(fromTempDir, targetDir, chatBackup);
            await rm(fromTempDir, { recursive: true, force: true });
            return;
        } catch (error) {
            if (!isProfileLockError(error) || attempt === PROFILE_PROMOTION_MAX_ATTEMPTS) {
                throw error;
            }

            if (process.platform === "win32" && attempt >= 2) {
                const closedCount = await forceCloseWindowsProcessesUsingPath(targetDir);
                if (closedCount > 0) {
                    console.warn(
                        `⚠️  Profile dir is locked. Closed ${closedCount} process(es) using ${targetDir} before retrying...`,
                    );
                }
            }

            const retryDelayMs = attempt * 1000;
            console.warn(
                `⚠️  Profile promotion hit a lock (${attempt}/${PROFILE_PROMOTION_MAX_ATTEMPTS}). Retrying in ${retryDelayMs}ms...`,
            );
            await sleep(retryDelayMs);
        }
    }
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

        // Let Chrome finish tearing down lock files before copying the profile.
        await sleep(1500);

        try {
            await promoteLoginProfileWithRetry(loginTempDir, profileDir);
            loginPromoted = true;
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error(
                `\n⚠️  Could not copy login profile to ${profileDir}: ${msg}
    Automatic retries/cleanup were attempted. Close Pepe MCP / other Chrome using that folder and run: npm run login
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
