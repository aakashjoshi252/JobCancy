import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../languageSwitcher/LanguageSwitcher";
import NotificationBell from "../notifications/NotificationBell";
import ProfileDropdown from "./ProfileDropdown";
import { getDashboardNavigation, getRoleLabel } from "./dashboardNavigation";

const getCurrentTitle = (role, location, company, t) => {
  const item = getDashboardNavigation({ role, company, t }).find(({ href, end, search }) => {
    const itemPath = href.split("?")[0];
    const pathMatches = end
      ? location.pathname === itemPath
      : location.pathname === itemPath || location.pathname.startsWith(`${itemPath}/`);

    return pathMatches && (!search || location.search.replace(/^\?/, "").includes(search));
  });

  return item?.label || getRoleLabel(role, t);
};

export default function Topbar({ role, company, onMenuClick, onLogoutRequest }) {
  const { t } = useTranslation(["common", "candidate", "recruiter", "admin"]);
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const title = getCurrentTitle(role, location, company, t);

  return (
    <header className="sticky top-0 z-30 border-b border-[#f0dce8] bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#ead8e3] bg-white text-[#5d0f51] shadow-sm transition hover:bg-[#fff7fb] lg:hidden"
            aria-label={t("sidebar.openMenu")}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase text-[#7a0e67]">{getRoleLabel(role, t)}</p>
            <h1 className="truncate font-serif text-lg font-semibold text-[#261723]">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden rounded-lg border border-[#ead8e3] bg-white sm:block">
            <LanguageSwitcher compact />
          </div>
          <div className="rounded-lg border border-[#ead8e3] bg-white">
            <NotificationBell />
          </div>
          <ProfileDropdown user={user} onLogoutRequest={onLogoutRequest} />
        </div>
      </div>
    </header>
  );
}
