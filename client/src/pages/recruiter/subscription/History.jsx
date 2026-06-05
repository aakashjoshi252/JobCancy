import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, History, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { subscriptionApi } from "../../../api/api";
import { formatCurrency, formatDateTime, getPaymentIdentifier } from "./subscriptionUtils";

export default function SubscriptionHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    subscriptionApi
      .get("/transactions")
      .then((response) => {
        if (active) setTransactions(response.data?.data || []);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Unable to load payment history.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <RefreshCw className="h-10 w-10 animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-2">
        <History className="h-6 w-6 text-teal-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">Payment History</h1>
          <p className="mt-1 text-sm text-gray-600">Review subscription orders, statuses, and invoices.</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[780px] w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length ? (
                transactions.map((transaction) => {
                  const paymentIdentifier = getPaymentIdentifier(transaction);
                  return (
                    <tr key={transaction._id}>
                      <td className="px-4 py-3 font-semibold text-gray-950">{transaction.planId?.planName || "-"}</td>
                      <td className="px-4 py-3">{formatCurrency(transaction.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          transaction.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : transaction.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{transaction.razorpayOrderId}</td>
                      <td className="px-4 py-3">{formatDateTime(transaction.createdAt)}</td>
                      <td className="px-4 py-3">
                        {paymentIdentifier ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/recruiter/subscription/invoice/${paymentIdentifier}`)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            View
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    No payment history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
