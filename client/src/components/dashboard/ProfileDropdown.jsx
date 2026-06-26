import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import UserAvatar from "../ui/UserAvatar";
import { getProfilePath, getSettingsPath } from "./dashboardNavigation";

export default function ProfileDropdown({ user, onLogoutRequest }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const role = user?.role || "candidate";
  const displayName = user?.username || user?.fullName || user?.email?.split("@")[0] || "User";

  useEffect(() => {
    const closeMenu = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 max-w-[11rem] items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 text-left shadow-sm transition hover:border-gray-300 hover:bg-gray-50 sm:max-w-[15rem]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserAvatar user={user} className="h-8 w-8 text-sm" />
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm font-semibold text-gray-950">{displayName}</span>
          <span className="block truncate text-xs capitalize text-gray-500">{t(`roles.${role}`, { defaultValue: role })}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-[calc(100%+0.65rem)] z-40 w-[min(16rem,calc(100vw-1rem))] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
          style={{ insetInlineEnd: 0 }}
        >
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
            <p className="truncate text-sm font-semibold text-gray-950">{displayName}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
          <div className="p-2">
            <Link
              to={getProfilePath(role)}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <UserRound className="h-4 w-4" />
              {t("common.profile", { defaultValue: "Profile" })}
            </Link>
            <Link
              to={getSettingsPath(role)}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <Settings className="h-4 w-4" />
              {t("settings.title", { defaultValue: "Settings" })}
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogoutRequest();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              {t("common.logout", { defaultValue: "Logout" })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
