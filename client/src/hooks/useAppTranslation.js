import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../redux/slices/languageSlice";
import { getSupportedLanguage } from "../i18n/languages";

export function useAppTranslation(namespace) {
  const { t, i18n, ready } = useTranslation(namespace);
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language.current);

  const changeLanguage = useCallback(
    async (languageCode) => {
      const nextLanguage = getSupportedLanguage(languageCode);
      await i18n.changeLanguage(nextLanguage);
      dispatch(setLanguage(nextLanguage));
    },
    [dispatch, i18n]
  );

  return {
    t,
    i18n,
    ready,
    language,
    changeLanguage,
  };
}
