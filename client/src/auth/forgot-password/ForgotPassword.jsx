import { useState } from "react";
import toast from "react-hot-toast";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MailCheck } from "lucide-react";
import { userApi } from "../../api/api";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import LanguageSwitcher from "../../components/languageSwitcher/LanguageSwitcher";
import { translateApiError } from "../../utils/apiErrors";

export default function ForgotPassword() {
  const { t } = useTranslation(["auth", "common", "errors", "validation"]);
  const navigate = useNavigate();
  const [step, setStep] = useState("request");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const updateForm = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const requestReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await userApi.post("/forgot-password", { email: form.email });
      setStep("reset");
      toast.success(t("forgot.otpSent"));
    } catch (error) {
      toast.error(translateApiError(error, t, "unexpected"));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error(t("validation:passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      await userApi.post("/reset-password", {
        email: form.email,
        otp: form.otp,
        password: form.password,
      });
      toast.success(t("forgot.resetSuccess"));
      navigate("/login");
    } catch (error) {
      toast.error(translateApiError(error, t, "unexpected"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto mb-4 flex max-w-5xl justify-end">
        <LanguageSwitcher compact />
      </div>
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:grid-cols-[1fr_1.1fr]">
        <div className="bg-gray-950 p-8 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500">
            <MailCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">{t("forgot.title")}</h1>
          <p className="mt-3 text-sm leading-6 text-gray-300">{t("forgot.subtitle")}</p>
        </div>

        <div className="p-6 sm:p-8">
          {step === "request" ? (
            <form onSubmit={requestReset} className="space-y-5">
              <FormField id="email" label={t("fields.emailAddress", { ns: "common" })}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateForm}
                  required
                  autoComplete="email"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder={t("placeholders.email", { ns: "common" })}
                />
              </FormField>
              <Button type="submit" isLoading={loading} className="w-full">
                {t("forgot.sendOtp")}
              </Button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-5">
              <FormField id="otp" label={t("forgot.otp")}>
                <input
                  id="otp"
                  name="otp"
                  value={form.otp}
                  onChange={updateForm}
                  required
                  inputMode="numeric"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
              <FormField id="password" label={t("forgot.newPassword")}>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={updateForm}
                  minLength={6}
                  required
                  autoComplete="new-password"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
              <FormField id="confirmPassword" label={t("forgot.confirmPassword")}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={updateForm}
                  minLength={6}
                  required
                  autoComplete="new-password"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
              <Button type="submit" isLoading={loading} className="w-full">
                {t("forgot.resetPassword")}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            <NavLink to="/login" className="font-medium text-blue-600 hover:text-blue-700">
              {t("forgot.backToLogin")}
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}
