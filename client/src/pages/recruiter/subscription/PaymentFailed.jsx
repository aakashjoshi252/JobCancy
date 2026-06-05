import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import useSubscriptionPayment from "./useSubscriptionPayment";

export default function SubscriptionPaymentFailed() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const plan = state?.plan || state?.order?.plan;
  const message = state?.message || "Payment failed or could not be verified.";
  const { payingPlanId, startPayment } = useSubscriptionPayment();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <section className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <AlertTriangle className="h-14 w-14 text-red-600" />
        <h1 className="mt-4 text-2xl font-bold text-gray-950">Payment Failed</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">{message}</p>

        {state?.error && (
          <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-4">
            <p className="text-xs font-semibold uppercase text-red-700">Failure details</p>
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs text-red-800">
              {typeof state.error === "string" ? state.error : JSON.stringify(state.error, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {plan?._id && (
            <button
              type="button"
              onClick={() => startPayment(plan)}
              disabled={payingPlanId === plan._id}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" />
              {payingPlanId === plan._id ? "Retrying..." : "Retry Payment"}
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("/recruiter/subscription/plans")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Plans
          </button>
        </div>
      </section>
    </div>
  );
}
