import { useTranslation } from "react-i18next";

export function PageLoader({ label }) {
  const { t } = useTranslation();

  return (
    <div className="jc-soft-page min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-[#f0dce8] border-t-[#5d0f51] animate-spin" />
        <p className="text-sm font-medium text-[#7b6575]">{label || t("common.loading")}</p>
      </div>
    </div>
  );
}

export function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-[#f0dce8] ${className}`} />;
}
