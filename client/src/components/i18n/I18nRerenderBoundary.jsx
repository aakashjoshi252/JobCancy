import { useEffect, useReducer } from "react";
import i18n, { applyDocumentLanguage } from "../../i18n";

export default function I18nRerenderBoundary({ children }) {
  const [, forceRender] = useReducer((value) => value + 1, 0);

  useEffect(() => {
    const handleLanguageChanged = (language) => {
      applyDocumentLanguage(language);
      forceRender();
    };

    i18n.on("languageChanged", handleLanguageChanged);
    handleLanguageChanged(i18n.resolvedLanguage || i18n.language);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  return children;
}
