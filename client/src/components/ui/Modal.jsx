import Button from "./Button";
import { useTranslation } from "react-i18next";

export default function Modal({ isOpen, title, children, onClose, footer }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-2 sm:items-center sm:p-4">
      <div className="flex max-h-[calc(100dvh-1rem)] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4">
          <h2 className="min-w-0 truncate text-base font-semibold text-gray-900 sm:text-lg">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label={t("common.close")}>
            {t("common.close")}
          </Button>
        </div>
        <div className="min-w-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
        {footer && <div className="border-t border-gray-100 px-4 py-3 sm:px-5 sm:py-4">{footer}</div>}
      </div>
    </div>
  );
}
