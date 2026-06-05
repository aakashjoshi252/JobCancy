import { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { ShieldCheck, SlidersHorizontal, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { userApi } from "../../../api/api";
import LanguageSwitcher from "../../../components/languageSwitcher/LanguageSwitcher";
import { PageHeader, PageShell } from "../../../components/layout/PageShell";
import Button from "../../../components/ui/Button";
import FormField from "../../../components/ui/FormField";
import StatCard from "../../../components/ui/StatCard";
import { translateApiError } from "../../../utils/apiErrors";

const initialPasswords = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function Settings() {
  const { t } = useTranslation(["common", "auth", "validation", "errors"]);
  const user = useSelector((state) => state.auth.user);
  const [passwords, setPasswords] = useState(initialPasswords);
  const [isSaving, setIsSaving] = useState(false);

  const updatePassword = (event) => {
    setPasswords((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submitPassword = async (event) => {
    event.preventDefault();

    if (passwords.newPassword.length < 6) {
      toast.error(t("validation:passwordMin", { count: 6, defaultValue: "Password must be at least 6 characters" }));
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error(t("validation:passwordMismatch"));
      return;
    }

    setIsSaving(true);
    try {
      await userApi.post("/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords(initialPasswords);
      toast.success(t("settings.passwordUpdated"));
    } catch (error) {
      toast.error(translateApiError(error, t, "unexpected"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("settings.eyebrow")}
        title={t("settings.title")}
        description={t("settings.description")}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-950">{t("settings.preferences")}</h2>
                <p className="mt-1 text-sm text-gray-600">{t("settings.preferencesHint")}</p>
              </div>
            </div>

            <div className="max-w-sm">
              <FormField id="language" label={t("language.label")}>
                <LanguageSwitcher className="w-full" />
              </FormField>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-950">{t("settings.security")}</h2>
                <p className="mt-1 text-sm text-gray-600">{t("settings.securityHint")}</p>
              </div>
            </div>

            <form onSubmit={submitPassword} className="grid gap-4 md:grid-cols-2">
              <FormField id="currentPassword" label={t("settings.currentPassword")}>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={updatePassword}
                  autoComplete="current-password"
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
              <FormField id="newPassword" label={t("settings.newPassword")}>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={updatePassword}
                  autoComplete="new-password"
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
              <FormField id="confirmPassword" label={t("settings.confirmPassword")}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={updatePassword}
                  autoComplete="new-password"
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
              <div className="flex items-end">
                <Button type="submit" isLoading={isSaving} className="w-full md:w-auto">
                  {t("settings.updatePassword")}
                </Button>
              </div>
            </form>
          </section>
        </div>

        <aside className="space-y-4">
          <StatCard
            icon={UserRound}
            label={t("settings.accountRole")}
            value={user?.role || t("common.na")}
            helper={user?.email}
          />
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
            {t("settings.productionHint")}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
