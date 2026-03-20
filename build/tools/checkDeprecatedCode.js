export default async function checkDeprecatedCode(args, ctx, performSearch) {
    const { query } = args;
    // Pepe is now a raw executioner. The agent is responsible for high-quality prompting.
    return await performSearch(query, ctx);
}
