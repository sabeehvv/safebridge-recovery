import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import process from "node:process";

const roots = ["app", "components", "lib"];
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const forbidden = [
  { label: "explicit any", pattern: /(:\s*any\b|\bas\s+any\b|<any>)/ },
  { label: "TypeScript suppression", pattern: /@ts-(ignore|nocheck)/ },
  { label: "unsafe HTML injection", pattern: /dangerouslySetInnerHTML/ },
  { label: "dynamic code execution", pattern: /\beval\s*\(/ },
  { label: "debug logging", pattern: /\bconsole\.log\s*\(/ }
];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return collectFiles(path);
      return sourceExtensions.has(extname(entry.name)) ? [path] : [];
    })
  );
  return nested.flat();
}

const files = (await Promise.all(roots.map(collectFiles))).flat();
const failures = [];

for (const file of files) {
  const source = await readFile(file, "utf8");
  const lines = source.split(/\r?\n/);
  for (const { label, pattern } of forbidden) {
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        failures.push(`${relative(process.cwd(), file)}:${index + 1} ${label}`);
      }
    });
  }
}

if (failures.length > 0) {
  console.error(`Quality check failed:\n${failures.join("\n")}`);
  process.exit(1);
}

console.log(`Quality check passed for ${files.length} source files.`);
