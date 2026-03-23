"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from 'axios';
import {
  CreditCard,
  Smartphone,
  Building,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function ResidentPayBill() {
  const [amount, setAmount] = useState(0);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [mode, setMode] = useState("UPI");
  const [flatNo, setFlatNo] = useState("");
  const [loading, setLoading] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear().toString();
    setMonth(currentMonth);
    setYear(currentYear);

    const fetchData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/resident-dashboard/stats/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          // outstandingAmount is the amount still owed this month
          setAmount(response.data.data.outstandingAmount);
          setFlatNo(response.data.data.flatNumber);
        }
      } catch (err) {
        console.error("Failed to fetch billing details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
 
 }, []);
  const handlePayment = async () => {
    if (amount <= 0) {
      setError("Your bill is paid for this month.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr || '{}');
      const token = localStorage.getItem('token');

      const payload = {
        user_id: user.id,
        amount: amount,
        month: month,
        year: year,
        mode: mode,
      };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/resident-payment/pay`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });

      if (response.data.success) {
        const today = new Date();
        const dateStr = today.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        setTransactionData({
          transactionId: response.data.transactionId,
          date: dateStr,
          amount: amount,
          mode: mode,
          month: month,
          year: year,
          flatNo: flatNo,
        });
        setPaymentSuccess(true);
      } else {
        throw new Error(response.data.message || "Failed to process payment");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred during payment processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess && transactionData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl shadow-slate-200/50 border border-slate-100 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
          <p className="text-slate-500 mb-8">
            Your maintenance bill for {transactionData.month} {transactionData.year} has been paid.
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 text-left mb-8 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Amount Paid</span>
              <span className="font-bold text-slate-800 text-base">₹{transactionData.amount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Transaction ID</span>
              <span className="font-semibold text-slate-700">{transactionData.transactionId}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Date</span>
              <span className="font-semibold text-slate-700">{transactionData.date}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Payment Mode</span>
              <span className="font-semibold text-slate-700">{transactionData.mode}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Flat No</span>
              <span className="font-semibold text-slate-700">{transactionData.flatNo}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Link
        href="/resident/subscriptions"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-[#5842F4] transition-colors font-medium text-sm mb-2"
      >
        <ChevronLeft size={16} /> Back to Subscriptions
      </Link>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#5842F4]">
          <CreditCard size={24} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            Make a Payment
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pay your monthly maintenance securely
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Payment Details</h3>
            
            {loading ? (
              <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Loading billing info...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Month</label>
                    <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-semibold">
                      {month}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Year</label>
                    <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-semibold">
                      {year}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Amount Due (₹)</label>
                  <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold text-lg">
                    {amount > 0 ? `₹${amount}` : "No outstanding dues"}
                  </div>
                  {amount <= 0 && (
                    <p className="text-sm text-green-600 font-medium mt-2">✓ Your maintenance for this month has already been paid.</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              Payment Method
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-md flex items-center gap-1">
                <ShieldCheck size={12} /> Secure
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setMode("UPI")}
                disabled={isProcessing}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${mode === 'UPI' ? 'border-[#5842F4] bg-indigo-50/50 text-[#5842F4]' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'} `}
              >
                <Smartphone size={28} className={mode === 'UPI' ? 'text-[#5842F4]' : 'text-slate-400'} />
                <span className={`font-bold text-sm ${mode === 'UPI' ? 'text-slate-800' : 'text-slate-500'}`}>UPI</span>
              </button>
              
              <button 
                onClick={() => setMode("Credit Card")}
                disabled={isProcessing}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${mode === 'Credit Card' ? 'border-[#5842F4] bg-indigo-50/50 text-[#5842F4]' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'} `}
              >
                <CreditCard size={28} className={mode === 'Credit Card' ? 'text-[#5842F4]' : 'text-slate-400'} />
                <span className={`font-bold text-sm ${mode === 'Credit Card' ? 'text-slate-800' : 'text-slate-500'}`}>Card</span>
              </button>
              
              <button 
                onClick={() => setMode("Net Banking")}
                disabled={isProcessing}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${mode === 'Net Banking' ? 'border-[#5842F4] bg-indigo-50/50 text-[#5842F4]' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'} `}
              >
                <Building size={28} className={mode === 'Net Banking' ? 'text-[#5842F4]' : 'text-slate-400'} />
                <span className={`font-bold text-sm ${mode === 'Net Banking' ? 'text-slate-800' : 'text-slate-500'}`}>Net Banking</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6 pb-6 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Bill Amount</span>
                <span className="text-slate-800 font-semibold">₹{amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Convenience Fee</span>
                <span className="text-slate-800 font-semibold">₹0</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-8">
              <span className="text-slate-800 font-bold">Total Pay</span>
              <span className="text-2xl font-black text-[#5842F4]">₹{amount}</span>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-medium mb-4">
                {error}
              </div>
            )}

            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-4 px-6 bg-[#5842F4] hover:bg-[#4a35e0] disabled:bg-[#a69bf4] disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Processing...
                </>
              ) : (
                `Pay ₹${amount}`
              )}
            </button>
            
            <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1 font-medium">
              <ShieldCheck size={14} /> 100% SECURE PAYMENT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
