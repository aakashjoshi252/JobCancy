import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Globe2, Languages } from "lucide-react";
import { supportedLanguages } from "../../i18n/languages";
import { useAppTranslation } from "../../hooks/useAppTranslation";

export default function LanguageSwitcher({ compact = false, className = "" }) {
  const { t, language, changeLanguage } = useAppTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  const selectedLanguage = useMemo(
    () => supportedLanguages.find((item) => item.code === language) || supportedLanguages[0],
    [language]
  );

  const filteredLanguages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return supportedLanguages;

    return supportedLanguages.filter((item) =>
      [item.code, item.label, item.nativeLabel, item.region]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [query]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectLanguage = async (languageCode) => {
    await changeLanguage(languageCode);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language.changeLanguage")}
        onClick={() => setOpen((current) => !current)}
        className={[
          "inline-flex h-10 max-w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-100",
          compact ? "min-w-0 sm:min-w-[132px]" : "min-w-[190px]",
        ].join(" ")}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          {compact ? <Globe2 className="h-4 w-4 shrink-0" /> : <Languages className="h-4 w-4 shrink-0 text-blue-600" />}
          <span className="truncate">{compact ? selectedLanguage.nativeLabel : `${selectedLanguage.nativeLabel} (${selectedLanguage.code.toUpperCase()})`}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
          style={{ insetInlineEnd: 0 }}
        >
          <div className="border-b border-gray-100 p-3">
            <label className="sr-only" htmlFor="language-search">
              {t("language.searchPlaceholder")}
            </label>
            <input
              id="language-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("language.searchPlaceholder")}
              className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div role="listbox" className="max-h-80 overflow-y-auto p-2">
            {filteredLanguages.map((item) => {
              const isSelected = item.code === selectedLanguage.code;

              return (
                <button
                  key={item.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectLanguage(item.code)}
                  className={[
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-start transition",
                    isSelected ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{item.nativeLabel}</span>
                    <span className="block truncate text-xs text-gray-500">
                      {item.label} - {item.code.toUpperCase()}
                    </span>
                  </span>
                  {isSelected && <Check className="h-4 w-4 shrink-0" aria-label={t("language.selected")} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
