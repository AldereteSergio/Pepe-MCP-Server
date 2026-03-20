/**
 * Tool handler for 'check_deprecated_code'.
 * Analyzes code for deprecated features or patterns and suggests replacements, using the Perplexity search logic.
 */
import type { PuppeteerContext } from "../types/index.js";

export default async function checkDeprecatedCode(
  args: { query: string },
  ctx: PuppeteerContext,
  performSearch: (prompt: string, ctx: PuppeteerContext) => Promise<string>,
): Promise<string> {
  const { query } = args;
  // Pepe is now a raw executioner. The agent is responsible for high-quality prompting.
  return await performSearch(query, ctx);
}
