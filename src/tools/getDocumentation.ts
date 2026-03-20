/**
 * Tool implementation for documentation retrieval
 */

import type { PuppeteerContext } from "../types/index.js";

/**
 * Handles documentation fetching and formatting
 */
export default async function getDocumentation(
  args: { query: string },
  ctx: PuppeteerContext,
  performSearch: (prompt: string, ctx: PuppeteerContext) => Promise<string>,
): Promise<string> {
  const { query } = args;
  // Pepe is now a raw executioner. The agent is responsible for high-quality prompting.
  return await performSearch(query, ctx);
}
