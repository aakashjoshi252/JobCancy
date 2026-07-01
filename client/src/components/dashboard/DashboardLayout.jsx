import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { companyApi, resumeApi } from "../../api/api";
import { setCompany } from "../../redux/slices/companySlice";
import { setResume } from "../../redux/slices/resumeSlice";
import useLogout from "../../hooks/useLogout";
import LocalizedMeta from "../i18n/LocalizedMeta";
import ConfirmLogoutModal from "./ConfirmLogoutModal";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ role }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const company = useSelector((state) => state.company.data);
  const resume = useSelector((state) => state.resume.data);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { logout, isLoggingOut } = useLogout();
  const resolvedRole = role || user?.role || "candidate";
  const isChatRoute = location.pathname.endsWith("/chat") || location.pathname.endsWith("/messages");

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (resolvedRole !== "recruiter" || !user?._id || company) return undefined;

    let active = true;

    companyApi
      .get(`/recruiter/${user._id}`)
      .then((response) => {
        if (active) dispatch(setCompany(response?.data?.data || response?.data || null));
      })
      .catch(() => {
        if (active) dispatch(setCompany(null));
      });

    return () => {
      active = false;
    };
  }, [company, dispatch, resolvedRole, user?._id]);

  useEffect(() => {
    if (resolvedRole !== "candidate" || !user?._id || resume) return undefined;

    let active = true;

    resumeApi
      .get(`/${user._id}`)
      .then((response) => {
        const payload = response?.data?.data || response?.data;
        const resumes = Array.isArray(payload) ? payload : payload ? [payload] : [];
        if (active) dispatch(setResume(resumes[0] || null));
      })
      .catch(() => {
        if (active) dispatch(setResume(null));
      });

    return () => {
      active = false;
    };
  }, [dispatch, resolvedRole, resume, user?._id]);

  return (
    <div className="jc-soft-page min-h-screen overflow-x-hidden text-[#261723]">
      <LocalizedMeta />
      <Sidebar
        role={resolvedRole}
        company={company}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onLogoutRequest={() => setLogoutOpen(true)}
      />

      <div className="min-w-0 lg:ps-72">
        <Topbar
          role={resolvedRole}
          company={company}
          onMenuClick={() => setMobileMenuOpen(true)}
          onLogoutRequest={() => setLogoutOpen(true)}
        />
        <main
          className={[
            "mx-auto min-w-0 w-full",
            isChatRoute
              ? "h-[calc(100dvh-4rem)] max-w-none overflow-hidden p-0"
              : "max-w-[1600px] px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-6",
          ].join(" ")}
        >
          <Outlet />
        </main>
      </div>

      <ConfirmLogoutModal
        isOpen={logoutOpen}
        isLoggingOut={isLoggingOut}
        onClose={() => setLogoutOpen(false)}
        onConfirm={logout}
      />
    </div>
  );
}
