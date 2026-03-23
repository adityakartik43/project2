"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Smartphone,
  Building,
  Receipt,
} from "lucide-react";

const paymentModeIcon = (mode) => {
  if (!mode) return <CreditCard size={16} />;
  const m = mode.toLowerCase();
  if (m.includes("upi")) return <Smartphone size={16} />;
  if (m.includes("net") || m.includes("bank")) return <Building size={16} />;
  return <CreditCard size={16} />;
};

const statusConfig = {
  PAID: { label: "Paid", icon: <CheckCircle2 size={16} />, classes: "bg-green-50 text-green-700 border-green-200" },
  PARTIAL: { label: "Partial", icon: <AlertCircle size={16} />, classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  UNPAID: { label: "Unpaid", icon: <Clock size={16} />, classes: "bg-red-50 text-red-700 border-red-200" },
};

export default function DetailedSubscriptionPage() {
  const params = useParams();
  const router = useRouter();
  const monthParam = params.month;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDetailedData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/resident-subscriptions/detail/${user.id}/${monthParam}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (monthParam) fetchDetailedData();
  }, [monthParam]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5842F4]" />
          <p className="text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const status = statusConfig[data.status] || statusConfig.UNPAID;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Back to Billing History
        </button>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-3 rounded-xl text-[#5842F4]">
                <Receipt size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Billing Period</p>
                <h1 className="text-2xl font-black text-slate-800">{data.billingPeriod}</h1>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${status.classes}`}>
              {status.icon} {status.label}
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-semibold mb-1">Flat No.</p>
              <p className="font-black text-slate-800 text-lg">{data.flatNumber}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-semibold mb-1">Flat Type</p>
              <p className="font-black text-slate-800 text-lg">{data.flatType}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-semibold mb-1">Monthly Fee</p>
              <p className="font-black text-slate-800 text-lg">₹{data.monthlyFee}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-semibold mb-1">Total Paid</p>
              <p className={`font-black text-lg ${data.totalPaid > 0 ? "text-green-600" : "text-red-500"}`}>
                ₹{data.totalPaid}
              </p>
            </div>
          </div>
          {data.outstanding > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex justify-between items-center">
              <p className="text-sm font-semibold text-red-600">Outstanding Balance</p>
              <p className="font-black text-red-600 text-lg">₹{data.outstanding}</p>
            </div>
          )}
        </div>

        {/* Payments list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
            Payment Transactions ({data.payments.length})
          </h2>

          {data.payments.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm italic">
              No payments made for this month yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 space-y-0">
              {data.payments.map((p, idx) => (
                <div key={p.id || idx} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                      {paymentModeIcon(p.payment_mode)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{p.payment_mode?.toUpperCase() || "—"}</p>
                      <p className="text-xs text-slate-400">{p.date}</p>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">{p.transaction_id}</p>
                    </div>
                  </div>
                  <p className="font-black text-slate-800 text-base shrink-0">₹{parseFloat(p.amount).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
