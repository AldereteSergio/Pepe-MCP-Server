/**
 * Handles intensive, multi-step research queries using Perplexity's 'Deep Research' mode
 */
export default async function deepResearch(args, _ctx, performDeepResearch) {
    const { query, attachments } = args;
    return await performDeepResearch(query, attachments);
}
