import { useTranslation } from "react-i18next";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

export default function ConfirmLogoutModal({ isOpen, isLoggingOut, onClose, onConfirm }) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("logout.title", { defaultValue: "Log out?" })}
      footer={(
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoggingOut}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoggingOut}>
            {t("common.logout", { defaultValue: "Logout" })}
          </Button>
        </div>
      )}
    >
      <p className="text-sm leading-6 text-gray-600">
        {t("logout.confirm", {
          defaultValue: "You will be signed out of this dashboard and returned to the login page.",
        })}
      </p>
    </Modal>
  );
}
