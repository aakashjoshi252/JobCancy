import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "../../i18n/languages";

const removeManagedLinks = () => {
  document.querySelectorAll("link[data-managed-hreflang='true']").forEach((node) => node.remove());
};

export default function LocalizedMeta() {
  const location = useLocation();
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const title = t("seo.defaultTitle", { defaultValue: "JewelCancy | Jewellery Recruitment Platform" });
    const description = t("seo.defaultDescription", {
      defaultValue: "India's premium recruitment platform for the Jewellery Industry.",
    });

    document.title = title;

    const descriptionTag =
      document.querySelector("meta[name='description']") ||
      document.head.appendChild(Object.assign(document.createElement("meta"), { name: "description" }));
    descriptionTag.setAttribute("content", description);

    removeManagedLinks();
    const baseUrl = `${window.location.origin}${location.pathname}`;
    supportedLanguages.forEach((language) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = language.code;
      link.href = `${baseUrl}?lang=${language.code}`;
      link.dataset.managedHreflang = "true";
      document.head.appendChild(link);
    });

    const xDefault = document.createElement("link");
    xDefault.rel = "alternate";
    xDefault.hreflang = "x-default";
    xDefault.href = baseUrl;
    xDefault.dataset.managedHreflang = "true";
    document.head.appendChild(xDefault);

    return removeManagedLinks;
  }, [i18n.resolvedLanguage, location.pathname, t]);

  return null;
}
