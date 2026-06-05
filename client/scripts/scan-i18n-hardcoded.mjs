import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src");
const extensions = new Set([".jsx", ".js"]);
const ignoredDirs = new Set(["locales", "i18n"]);

const textNodePattern = />\s*([A-Z][^<{}`\n]{2,})\s*</g;
const attrPattern = /\b(placeholder|aria-label|title)=["']([^"']*[A-Za-z][^"']*)["']/g;

const walk = (directory) => {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return ignoredDirs.has(entry.name) ? [] : walk(fullPath);
    }
    return extensions.has(path.extname(entry.name)) ? [fullPath] : [];
  });
};

const normalize = (value) => value.replace(/\s+/g, " ").trim();

const findings = [];

for (const filePath of walk(root)) {
  const source = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(process.cwd(), filePath);

  for (const match of source.matchAll(textNodePattern)) {
    const value = normalize(match[1]);
    if (value && !value.includes("className") && !value.startsWith("&")) {
      findings.push({ file: relativePath, type: "text", value });
    }
  }

  for (const match of source.matchAll(attrPattern)) {
    findings.push({ file: relativePath, type: match[1], value: normalize(match[2]) });
  }
}

if (findings.length === 0) {
  console.log("No obvious hardcoded UI strings found.");
  process.exit(0);
}

console.log(`Found ${findings.length} possible hardcoded UI strings:\n`);
for (const finding of findings) {
  console.log(`${finding.file} [${finding.type}] ${finding.value}`);
}

process.exitCode = 1;
