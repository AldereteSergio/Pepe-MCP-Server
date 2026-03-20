/**
 * Tool implementation for finding APIs
 */

import type { PuppeteerContext } from "../types/index.js";

/**
 * Handles API discovery and comparison
 */
export default async function findApis(
  args: { query: string },
  ctx: PuppeteerContext,
  performSearch: (prompt: string, ctx: PuppeteerContext) => Promise<string>,
): Promise<string> {
  const { query } = args;
  // Pepe is now a raw executioner. The agent is responsible for high-quality prompting.
  return await performSearch(query, ctx);
}
