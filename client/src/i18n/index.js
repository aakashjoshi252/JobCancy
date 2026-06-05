import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  DEFAULT_LANGUAGE,
  getLanguageDirection,
  getSupportedLanguage,
  namespaces,
  supportedLanguageCodes,
} from "./config";
import { detectInitialLanguage, persistLanguage } from "./storage";

const primaryLocaleModules = import.meta.glob("./locales/*/*.json");
const legacyLocaleModules = import.meta.glob("../locales/*/*.json");

const deepMerge = (base, override) => {
  if (Array.isArray(base) || Array.isArray(override)) return override ?? base ?? [];
  if (!base || typeof base !== "object") return override ?? base ?? {};
  if (!override || typeof override !== "object") return base;

  return Object.keys({ ...base, ...override }).reduce((merged, key) => {
    merged[key] = deepMerge(base[key], override[key]);
    return merged;
  }, {});
};

const loadResource = async (modules, key) => {
  const loader = modules[key];
  if (!loader) return {};
  const resource = await loader();
  return resource.default || {};
};

const loadNamespace = async (language, namespace) => {
  const languageCode = getSupportedLanguage(language);
  const primaryKey = `./locales/${languageCode}/${namespace}.json`;
  const primaryFallbackKey = `./locales/${DEFAULT_LANGUAGE}/${namespace}.json`;
  const legacyKey = `../locales/${languageCode}/${namespace}.json`;
  const legacyFallbackKey = `../locales/${DEFAULT_LANGUAGE}/${namespace}.json`;

  const fallbackResource = deepMerge(
    await loadResource(legacyLocaleModules, legacyFallbackKey),
    await loadResource(primaryLocaleModules, primaryFallbackKey)
  );
  const languageResource = deepMerge(
    await loadResource(legacyLocaleModules, legacyKey),
    await loadResource(primaryLocaleModules, primaryKey)
  );
  const resource = deepMerge(fallbackResource, languageResource);

  if (!Object.keys(resource).length) {
    throw new Error(`Missing i18n namespace: ${namespace}`);
  }

  return resource;
};

const lazyJsonBackend = {
  type: "backend",
  init: () => {},
  read: async (language, namespace, callback) => {
    try {
      callback(null, await loadNamespace(language, namespace));
    } catch (error) {
      callback(error, null);
    }
  },
};

export const applyDocumentLanguage = (languageCode) => {
  const language = getSupportedLanguage(languageCode);
  const direction = getLanguageDirection(language);

  document.documentElement.lang = language;
  document.documentElement.dir = direction;
  document.documentElement.dataset.language = language;
};

i18n
  .use(lazyJsonBackend)
  .use(initReactI18next)
  .init({
    lng: detectInitialLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: supportedLanguageCodes,
    nonExplicitSupportedLngs: true,
    ns: namespaces,
    defaultNS: "common",
    fallbackNS: [
      "common",
      "translation",
      "auth",
      "candidate",
      "recruiter",
      "admin",
      "jobs",
      "applications",
      "chat",
      "notifications",
      "subscription",
      "reports",
      "validation",
      "errors",
      "professions",
      "contact",
      "blog",
    ],
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
    load: "languageOnly",
    returnEmptyString: false,
    partialBundledLanguages: true,
  });

i18n.on("languageChanged", (languageCode) => {
  const language = persistLanguage(languageCode);
  applyDocumentLanguage(language);
});

applyDocumentLanguage(i18n.resolvedLanguage || i18n.language || DEFAULT_LANGUAGE);

export default i18n;
