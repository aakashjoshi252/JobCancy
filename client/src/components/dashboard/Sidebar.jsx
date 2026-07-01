import { LogOut, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../languageSwitcher/LanguageSwitcher";
import UserAvatar from "../ui/UserAvatar";
import { getDashboardHome, getDashboardNavigation, getProfilePath, getRoleLabel } from "./dashboardNavigation";

const isItemActive = (item, location) => {
  const itemPath = item.href.split("?")[0];
  const pathMatches = item.end
    ? location.pathname === itemPath
    : location.pathname === itemPath || location.pathname.startsWith(`${itemPath}/`);

  if (!pathMatches) return false;
  if (!item.search) return true;

  return location.search.replace(/^\?/, "").includes(item.search);
};

export default function Sidebar({ role, company, isOpen, onClose, onLogoutRequest }) {
  const { t } = useTranslation(["common", "candidate", "recruiter", "admin"]);
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const navigation = getDashboardNavigation({ role, company, t });

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[#2d1028]/45 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
          aria-label={t("sidebar.closeMenu")}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 start-0 z-50 flex w-72 flex-col border-e border-[#48113f] bg-[#310a2b] text-white shadow-2xl transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Link to={getDashboardHome(role)} onClick={onClose} className="min-w-0">
            <span className="block text-xs font-semibold uppercase text-[#f2cfe5]">{t("sidebar.brand")}</span>
            <span className="block truncate font-serif text-xl font-semibold text-white">{getRoleLabel(role, t)}</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-300 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label={t("sidebar.closeMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item, location);

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={[
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-white text-[#5d0f51] shadow-lg shadow-[#160512]/30"
                    : "text-gray-300 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-white/10 p-3">
          <Link
            to={getProfilePath(role)}
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
          >
            <UserAvatar user={user} className="h-10 w-10 text-sm" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">
                {user?.username || user?.email || t("common.profile")}
              </span>
              <span className="block truncate text-xs capitalize text-[#e7c8dd]">{t(`roles.${role}`, { defaultValue: role })}</span>
            </span>
          </Link>
          <div className="rounded-lg border border-white/10 bg-white/5 p-1 sm:hidden">
            <LanguageSwitcher compact />
          </div>
          <button
            type="button"
            onClick={onLogoutRequest}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-100 transition hover:bg-red-500/20 hover:text-white"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {t("common.logout", { defaultValue: "Logout" })}
          </button>
        </div>
      </aside>
    </>
  );
}
