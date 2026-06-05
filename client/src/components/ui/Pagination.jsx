import Button from "./Button";
import { useTranslation } from "react-i18next";

export default function Pagination({ page, pages, onPageChange, disabled = false }) {
  const { t } = useTranslation();

  if (pages <= 1) return null;

  return (
    <nav className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <Button variant="secondary" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>
        {t("common.previous")}
      </Button>
      <span className="text-sm font-medium text-gray-600">
        {t("common.pageOf", { page, pages })}
      </span>
      <Button variant="secondary" disabled={disabled || page >= pages} onClick={() => onPageChange(page + 1)}>
        {t("common.next")}
      </Button>
    </nav>
  );
}
