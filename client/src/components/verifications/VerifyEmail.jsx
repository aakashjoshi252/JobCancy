import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../api/api";

export default function VerifyEmail() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);

  const email = localStorage.getItem("verifyEmail");

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await userApi.post("/verify-email", { email, otp });

      alert("Email verified!");

      localStorage.removeItem("verifyEmail");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    await userApi.post("/resend-otp", { email });
    alert("OTP resent");
    setTimer(60);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow text-center w-96">

        <h2 className="text-xl font-bold mb-3">Verify Email</h2>

        <p className="text-gray-600 mb-4">
          OTP sent to <b>{email}</b>
        </p>

        <input
          type="text"
          maxLength="6"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border p-3 rounded text-center text-lg mb-4"
          placeholder="Enter OTP"
        />

        <button
          onClick={handleVerify}
          className="w-full bg-blue-900 text-white py-2 rounded"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <div className="mt-4">
          {timer > 0 ? (
            <p>Resend in {timer}s</p>
          ) : (
            <button onClick={resendOtp} className="text-blue-700">
              Resend OTP
            </button>
          )}
        </div>

      </div>
    </div>
  );
}