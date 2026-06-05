import {
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE_KEY,
  LANGUAGE_STORAGE_KEY,
  getSupportedLanguage,
} from "./languages";
import { detectPreferredLanguage } from "./languageDetector";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export const getCookieLanguage = () => {
  if (typeof document === "undefined") return null;

  try {
    const cookie = document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${LANGUAGE_COOKIE_KEY}=`));

    return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
  } catch {
    return null;
  }
};

export const getLocalStorageLanguage = () => {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage?.getItem(LANGUAGE_STORAGE_KEY) || null;
  } catch {
    return null;
  }
};

export const detectInitialLanguage = () => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  return detectPreferredLanguage();
};

export const persistLanguage = (languageCode) => {
  const language = getSupportedLanguage(languageCode);
  if (typeof window === "undefined") return language;

  try {
    window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Storage may be unavailable in private or embedded browsing contexts.
  }

  try {
    document.cookie = `${LANGUAGE_COOKIE_KEY}=${encodeURIComponent(language)}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
  } catch {
    // Cookies can also be disabled; Redux still keeps the language for this session.
  }

  return language;
};

export const getPersistedLanguage = () =>
  getSupportedLanguage(
    typeof window === "undefined"
      ? DEFAULT_LANGUAGE
      : getLocalStorageLanguage() || getCookieLanguage() || DEFAULT_LANGUAGE
  );
