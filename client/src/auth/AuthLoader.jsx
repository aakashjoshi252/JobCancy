import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { authLoaded, logout } from "../redux/slices/authSlice";
import { userApi } from "../api/api";
import { PageLoader } from "../components/ui/Loader";

export default function AuthLoader({ children }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restoreUser = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        dispatch(logout());
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const res = await userApi.get("/me", {
          withCredentials: true,
          skipAuthRedirect: true,
        });

        const user = res.data?.data?.user || res.data?.user;
        if (isMounted && user) {
          dispatch(authLoaded({ user, token }));
        }
      } catch (err) {
        if (isMounted && [401, 403].includes(err.response?.status)) {
          dispatch(logout());
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    restoreUser();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  if (loading) return <PageLoader />;

  return children;
}
