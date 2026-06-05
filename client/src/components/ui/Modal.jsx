import Button from "./Button";
import { useTranslation } from "react-i18next";

export default function Modal({ isOpen, title, children, onClose, footer }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label={t("common.close")}>
            {t("common.close")}
          </Button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="border-t border-gray-100 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
