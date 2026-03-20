/**
 * Modular logging utility for MCP servers.
 * - All logs (info, warn, error) are written to stderr (console.error) to avoid corrupting MCP JSON protocol on stdout.
 * - Supports log levels, timestamps, and optional metadata.
 * - Used everywhere in the codebase for consistency.
 * - Easily extensible for future needs (e.g., file/remote logging).
 */
export function log(level, message, meta) {
    // Only log errors and critical info to reduce noise
    if (level === "warn" && !message.includes("CAPTCHA") && !message.includes("failed")) {
        return; // Skip most warnings
    }
    const timestamp = new Date().toISOString();
    // Always use console.error for all log levels to keep stdout clean for MCP protocol
    if (meta && Object.keys(meta).length > 0) {
        // eslint-disable-next-line no-console
        console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}`, meta);
    }
    else {
        // eslint-disable-next-line no-console
        console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
}
export const logInfo = (msg, meta) => log("info", msg, meta);
export const logWarn = (msg, meta) => log("warn", msg, meta);
export const logError = (msg, meta) => log("error", msg, meta);
