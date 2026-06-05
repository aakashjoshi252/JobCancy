import {
  DEFAULT_LANGUAGE,
  getSupportedLanguage,
  supportedLanguageCodes,
} from "./languages";

const LANGUAGE_COOKIE_KEY = "jobs_placements_language";
const LANGUAGE_STORAGE_KEY = "jobs_placements_language";

const getBrowserLanguages = () => {
  if (typeof navigator === "undefined") return [];
  return [...(navigator.languages || []), navigator.language].filter(Boolean);
};

const getStoredLanguage = () => {
  try {
    return window.localStorage?.getItem(LANGUAGE_STORAGE_KEY) || null;
  } catch {
    return null;
  }
};

const getCookieLanguage = () => {
  try {
    const cookieValue = document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${LANGUAGE_COOKIE_KEY}=`))
      ?.split("=")[1];

    return cookieValue ? decodeURIComponent(cookieValue) : null;
  } catch {
    return null;
  }
};

export const detectPreferredLanguage = () => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  const maybePathLanguage = window.location.pathname
    .split("/")
    .filter(Boolean)[0];
  const pathLanguage = supportedLanguageCodes.includes(maybePathLanguage)
    ? maybePathLanguage
    : null;
  const queryLanguage = new URLSearchParams(window.location.search).get("lang");
  const storedLanguage = getStoredLanguage();
  const cookieLanguage = getCookieLanguage();

  const candidates = [
    pathLanguage,
    queryLanguage,
    storedLanguage,
    cookieLanguage,
    ...getBrowserLanguages(),
  ];

  return getSupportedLanguage(candidates.find(Boolean) || DEFAULT_LANGUAGE);
};
