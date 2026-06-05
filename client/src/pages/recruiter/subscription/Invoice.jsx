import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, Printer, ReceiptText, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { subscriptionApi } from "../../../api/api";
import { formatCurrency, formatDateTime } from "./subscriptionUtils";

export default function SubscriptionInvoice() {
  const { paymentId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    subscriptionApi
      .get(`/invoice/${paymentId}`)
      .then((response) => {
        if (active) setTransaction(response.data?.data || null);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Unable to load invoice.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [paymentId]);

  const receiptText = useMemo(() => {
    if (!transaction) return "";
    return [
      "Job Placement Platform - Subscription Receipt",
      `Receipt: ${transaction.receipt || transaction._id}`,
      `Plan: ${transaction.planId?.planName || "-"}`,
      `Amount: ${formatCurrency(transaction.amount)}`,
      `Status: ${transaction.status}`,
      `Order ID: ${transaction.razorpayOrderId || "-"}`,
      `Payment ID: ${transaction.razorpayPaymentId || "-"}`,
      `Date: ${formatDateTime(transaction.verifiedAt || transaction.createdAt)}`,
    ].join("\n");
  }, [transaction]);

  const downloadReceipt = () => {
    const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `subscription-receipt-${transaction?.receipt || transaction?._id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <RefreshCw className="h-10 w-10 animate-spin text-teal-700" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">Invoice not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <section className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-6 w-6 text-teal-700" />
            <div>
              <h1 className="text-2xl font-bold text-gray-950">Subscription Invoice</h1>
              <p className="text-sm text-gray-500">{transaction.receipt}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              type="button"
              onClick={downloadReceipt}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InvoiceField label="Plan" value={transaction.planId?.planName} />
          <InvoiceField label="Amount" value={formatCurrency(transaction.amount)} />
          <InvoiceField label="Status" value={transaction.status} />
          <InvoiceField label="Date" value={formatDateTime(transaction.verifiedAt || transaction.createdAt)} />
          <InvoiceField label="Razorpay Order ID" value={transaction.razorpayOrderId} mono />
          <InvoiceField label="Razorpay Payment ID" value={transaction.razorpayPaymentId || "-"} mono />
        </div>

        {transaction.status === "failed" && (
          <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-4">
            <p className="text-xs font-semibold uppercase text-red-700">Failure reason</p>
            <p className="mt-1 text-sm text-red-800">{transaction.failureReason || "Payment failed."}</p>
          </div>
        )}
      </section>
    </div>
  );
}

function InvoiceField({ label, value, mono = false }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className={`mt-1 break-words text-sm font-bold capitalize text-gray-950 ${mono ? "font-mono normal-case" : ""}`}>
        {value || "-"}
      </p>
    </div>
  );
}
