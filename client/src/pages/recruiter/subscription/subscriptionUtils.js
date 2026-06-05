export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-IN") : "-";

export const formatDateTime = (date) =>
  date ? new Date(date).toLocaleString("en-IN") : "-";

export const isUsableRazorpayKey = (key) => /^rzp_(test|live)_/.test(String(key || ""));

export const loadRazorpayCheckout = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector("script[data-razorpay-checkout]");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const getPlanDisplayName = (plan) => plan?.planName || plan?.planSnapshot?.planName || "-";

export const planLimitLabel = (plan) =>
  plan?.isUnlimited ? "Unlimited posts" : `${Number(plan?.jobPostLimit || 0)} jobs/month`;

export const durationLabel = (plan) => {
  if (!plan) return "-";
  const value = Number(plan.duration || 1);
  if (plan.durationType === "year") return `${value} year${value > 1 ? "s" : ""}`;
  return `${value} month${value > 1 ? "s" : ""}`;
};

export const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message ||
  error?.error?.description ||
  error?.description ||
  error?.message ||
  fallback;

export const getPaymentIdentifier = (transaction) =>
  transaction?.razorpayPaymentId || transaction?.razorpayOrderId || transaction?._id || "";
