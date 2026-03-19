/**
 * Tool implementation for Deep Research functionality
 */
import type { PuppeteerContext } from "../types/index.js";

/**
 * Handles intensive, multi-step research queries using Perplexity's 'Deep Research' mode
 */
export default async function deepResearch(
  args: {
    query: string;
    attachments?: string[];
  },
  _ctx: PuppeteerContext,
  performDeepResearch: (query: string, attachments?: string[]) => Promise<string>,
): Promise<string> {
  const { query, attachments } = args;
  return await performDeepResearch(query, attachments);
}
