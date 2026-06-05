import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { userApi } from "../api/api";
import { useSocket } from "../context/SocketContext";
import { apiSlice } from "../services/apiSlice";
import { logout as logoutAction } from "../redux/slices/authSlice";
import { clearCompany } from "../redux/slices/companySlice";
import { clearResume } from "../redux/slices/resumeSlice";
import { clearNotificationState } from "../redux/slices/notificationSlice";

export default function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { disconnect } = useSocket();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await userApi.post("/logout", undefined, { skipAuthRedirect: true });
    } catch {
      // Local logout still needs to complete if the server session already expired.
    } finally {
      disconnect();
      dispatch(apiSlice.util.resetApiState());
      dispatch(clearNotificationState());
      dispatch(clearResume());
      dispatch(clearCompany());
      dispatch(logoutAction());
      toast.success(t("logout.success", { defaultValue: "Logged out successfully" }));
      navigate("/login", { replace: true });
      setIsLoggingOut(false);
    }
  }, [disconnect, dispatch, isLoggingOut, navigate, t]);

  return { logout, isLoggingOut };
}
