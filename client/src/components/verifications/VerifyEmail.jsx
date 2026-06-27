import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { userApi } from "../../api/api";

const normalizeEmail = (email = "") => String(email || "").trim().toLowerCase();
const getApiMessage = (error, fallback) => error.response?.data?.message || fallback;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryEmail = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return normalizeEmail(params.get("email"));
  }, [location.search]);

  const initialEmail =
    normalizeEmail(location.state?.email) ||
    queryEmail ||
    normalizeEmail(localStorage.getItem("verifyEmail"));

  const initialDevOtp = location.state?.devOtp || localStorage.getItem("verifyEmailDevOtp") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [devOtp, setDevOtp] = useState(initialDevOtp);

  useEffect(() => {
    const routeEmail = normalizeEmail(location.state?.email) || queryEmail;
    if (routeEmail) {
      setEmail(routeEmail);
    }
  }, [location.state, queryEmail]);

  useEffect(() => {
    const normalizedEmail = normalizeEmail(email);
    if (normalizedEmail) {
      localStorage.setItem("verifyEmail", normalizedEmail);
    } else {
      localStorage.removeItem("verifyEmail");
    }
  }, [email]);

  useEffect(() => {
    if (devOtp) {
      localStorage.setItem("verifyEmailDevOtp", devOtp);
    }
  }, [devOtp]);

  useEffect(() => {
    if (timer === 0) return undefined;
    const interval = setInterval(() => setTimer((current) => current - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (event) => {
    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
  };

  const handleVerify = async () => {
    const normalizedEmail = normalizeEmail(email);
    const submittedOtp = otp.trim();

    if (!normalizedEmail) {
      toast.error("Enter the email address used during registration.");
      return;
    }

    if (submittedOtp.length !== 6) {
      toast.error("Enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const response = await userApi.post("/verify-email", {
        email: normalizedEmail,
        otp: submittedOtp,
      });

      toast.success(response.data?.message || "Email verified successfully");
      localStorage.removeItem("verifyEmail");
      localStorage.removeItem("verifyEmailDevOtp");
      navigate("/login", { replace: true, state: { verifiedEmail: normalizedEmail } });
    } catch (error) {
      toast.error(getApiMessage(error, "Invalid or expired OTP"));
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      toast.error("Enter the email address used during registration.");
      return;
    }

    setResending(true);
    try {
      const response = await userApi.post("/resend-otp", { email: normalizedEmail });
      const nextDevOtp = response.data?.data?.devOtp;

      if (nextDevOtp) {
        setDevOtp(nextDevOtp);
      } else {
        setDevOtp("");
        localStorage.removeItem("verifyEmailDevOtp");
      }

      toast.success(response.data?.message || "OTP resent successfully");
      setTimer(60);
    } catch (error) {
      toast.error(getApiMessage(error, "Unable to resend OTP"));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow">
        <h2 className="mb-3 text-xl font-bold text-gray-900">Verify Email</h2>

        <p className="mb-5 text-sm text-gray-600">
          Enter the 6-digit code sent by JewelCancy to complete registration.
        </p>

        <label className="mb-1 block text-left text-sm font-medium text-gray-700" htmlFor="verify-email">
          Email address
        </label>
        <input
          id="verify-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mb-4 w-full rounded border border-gray-300 p-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          placeholder="you@example.com"
        />

        <label className="mb-1 block text-left text-sm font-medium text-gray-700" htmlFor="verify-otp">
          Verification code
        </label>
        <input
          id="verify-otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength="6"
          value={otp}
          onChange={handleOtpChange}
          className="mb-4 w-full rounded border border-gray-300 p-3 text-center text-lg tracking-widest outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          placeholder="000000"
        />

        {import.meta.env.DEV && devOtp && (
          <p className="mb-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Development OTP: <b>{devOtp}</b>
          </p>
        )}

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading}
          className={`w-full rounded py-2 font-semibold text-white transition ${
            loading ? "cursor-not-allowed bg-gray-400" : "bg-blue-900 hover:bg-blue-800"
          }`}
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <div className="mt-4 text-sm text-gray-600">
          {timer > 0 ? (
            <p>Resend in {timer}s</p>
          ) : (
            <button
              type="button"
              onClick={resendOtp}
              disabled={resending}
              className="font-medium text-blue-700 hover:text-blue-900 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-4 text-sm">
          <NavLink to="/login" className="font-medium text-blue-700 hover:text-blue-900">
            Login
          </NavLink>
          <NavLink to="/register" className="font-medium text-blue-700 hover:text-blue-900">
            Register again
          </NavLink>
        </div>
      </div>
    </div>
  );
}