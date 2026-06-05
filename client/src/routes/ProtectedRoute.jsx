import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import EmptyState from "../components/feedback/EmptyState";
import Button from "../components/ui/Button";
import { PageLoader } from "../components/ui/Loader";

export default function ProtectedRoute({ children, roles }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, loading, token, user } = useSelector((state) => state.auth);
  const allowedRoles = Array.isArray(roles) ? roles : roles ? [roles] : [];

  if (isLoading || loading) {
    return <PageLoader />;
  }

  if (!token || !isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] px-4 py-10">
        <EmptyState
          title={t("authz.deniedTitle")}
          description={t("authz.deniedDescription")}
          actionLabel={t("authz.goToDashboard")}
          onAction={() => {
            navigate(
              user.role === "admin"
                ? "/admin"
                : user.role === "recruiter"
                  ? "/recruiter/dashboard"
                  : "/candidate/home",
              { replace: true }
            );
          }}
        />
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={() => window.history.back()}>
            {t("authz.goBack")}
          </Button>
        </div>
      </div>
    );
  }

  return children;
}
