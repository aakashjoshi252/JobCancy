import { useTranslation } from "react-i18next";

export function PageLoader({ label }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        <p className="text-sm font-medium text-gray-600">{label || t("common.loading")}</p>
      </div>
    </div>
  );
}

export function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />;
}
