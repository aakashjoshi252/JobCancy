import fs from "node:fs";
import path from "node:path";
import { namespaces, supportedLanguageCodes } from "../src/i18n/config.js";

const localeRoots = [path.resolve("src/i18n/locales"), path.resolve("src/locales")];

const readJson = (filePath) => {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

const mergeMissingKeys = (source, target) => {
  if (Array.isArray(source)) return Array.isArray(target) ? target : source;
  if (!source || typeof source !== "object") return target ?? source;

  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [
      key,
      mergeMissingKeys(value, target?.[key]),
    ])
  );
};

for (const localeRoot of localeRoots) {
  for (const language of supportedLanguageCodes) {
    const languageDirectory = path.join(localeRoot, language);
    fs.mkdirSync(languageDirectory, { recursive: true });

    for (const namespace of namespaces) {
      const englishPath = path.join(localeRoot, "en", `${namespace}.json`);
      const targetPath = path.join(languageDirectory, `${namespace}.json`);
      const englishResource = readJson(englishPath);
      const existingResource = readJson(targetPath);
      const nextResource = language === "en" ? englishResource : mergeMissingKeys(englishResource, existingResource);

      fs.writeFileSync(targetPath, `${JSON.stringify(nextResource, null, 2)}\n`, "utf8");
    }
  }
}

console.log(`Synced ${namespaces.length} namespaces across ${supportedLanguageCodes.length} languages in ${localeRoots.length} locale roots.`);
