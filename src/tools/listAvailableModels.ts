/**
 * Tool implementation for listing available AI models
 */

/**
 * Retrieves the list of AI models currently available in the Perplexity account
 */
export default async function listAvailableModels(
  _args: Record<string, never>,
  listModels: () => Promise<string[]>,
): Promise<string> {
  const models = await listModels();
  return JSON.stringify({ models }, null, 2);
}
