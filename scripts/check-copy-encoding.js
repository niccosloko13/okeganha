const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const TARGET_DIRS = ["app", "components", "lib"];
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".md", ".txt", ".json"]);
const FORBIDDEN = ["\u00C3", "\u00C2", "\uFFFD"];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (TEXT_EXTENSIONS.has(ext)) {
      files.push(fullPath);
    }
  }

  return files;
}

function findForbidden(content) {
  const hits = [];
  for (const token of FORBIDDEN) {
    if (content.includes(token)) hits.push(token);
  }
  return hits;
}

const allFiles = TARGET_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)));
const offenders = [];

for (const filePath of allFiles) {
  const content = fs.readFileSync(filePath, "utf8");
  const hits = findForbidden(content);
  if (hits.length > 0) {
    offenders.push({ filePath: path.relative(ROOT, filePath), hits });
  }
}

if (offenders.length > 0) {
  console.error("[check:copy] Caracteres de encoding inválidos encontrados:");
  for (const offender of offenders) {
    console.error(`- ${offender.filePath} -> ${offender.hits.join(", ")}`);
  }
  process.exit(1);
}

console.log("[check:copy] OK: nenhum caractere de mojibake encontrado em app/, components/ e lib/.");
