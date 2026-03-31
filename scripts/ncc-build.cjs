const { spawnSync } = require("child_process");
const path = require("path");

const cli = require.resolve("@vercel/ncc/dist/ncc/cli.js");
const root = path.join(__dirname, "..");
const args = [
  cli,
  "build",
  "src/main.ts",
  "-o",
  "dist",
  "--minify",
  "--no-cache",
];
const r = spawnSync(process.execPath, args, { stdio: "inherit", cwd: root });
process.exit(r.status === null ? 1 : r.status);
