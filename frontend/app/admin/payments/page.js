"use client";

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, ShieldCheck, RotateCcw, Save, 
  User, Hash, Calendar, Banknote, FileText, History
} from 'lucide-react';
import axios from 'axios';

export default function PaymentEntry() {
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [flats, setFlats] = useState([]);
  
  // Form State
  const [selectedFlat, setSelectedFlat] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionId, setTransactionId] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Constants
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = months[new Date().getMonth()];

  // Initialization
  useEffect(() => {
    setSelectedMonth(currentMonthName);
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token");
      const resFlats = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/users/get-details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resFlats.data.success) setFlats(resFlats.data.data);
    } catch (error) {
      console.error("Error fetching initial data", error);
    }
  };

  // Fetch resident details when flat changes
  useEffect(() => {
    if (selectedFlat) {
      const fetchResidentData = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/payments/resident/${selectedFlat}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success && res.data.data.length > 0) {
            setOwnerName(res.data.data[0].name);
            setAmount(res.data.data[0].monthly_fee);
          } else {
            setOwnerName("Not found");
            setAmount("");
          }
        } catch (error) {
          console.error("Error fetching resident data", error);
        }
      };
      fetchResidentData();
    } else {
      setOwnerName("");
      setAmount("");
    }
  }, [selectedFlat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFlat || !amount || !selectedMonth || !selectedYear || !transactionDate) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        flatNo: selectedFlat,
        amount: Number(amount),
        month: selectedMonth,
        year: String(selectedYear),
        mode: paymentMode,
        date: transactionDate,
        transactionId: transactionId 
      };

      const token = localStorage.getItem("token");
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/payments/make-payment`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 201) {
        alert("Payment recorded successfully!");
        handleReset();
      }
    } catch (error) {
      console.error("Error submitting payment", error);
      alert("Failed to record payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFlat("");
    setOwnerName("");
    setAmount("");
    setSelectedMonth(currentMonthName);
    setSelectedYear(new Date().getFullYear());
    setPaymentMode('UPI');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setTransactionId("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-[#5842F4]">
          <CreditCard size={24} strokeWidth={2.5} />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manual Payment Entry</h1>
        </div>
        <p className="text-slate-500 text-sm">Record offline collections like Cash, UPI, or Cheques.</p>
        
        <div className="pt-2 flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-[10px] font-bold text-green-600 border border-green-100 uppercase tracking-wider">
            <ShieldCheck size={12} /> Secure Admin Portal
          </span>
        </div>
      </div>

      {/* Main Entry Form Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 md:p-10">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Flat Number */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
                <Hash size={14} /> Flat Number
              </label>
              <select 
                value={selectedFlat}
                onChange={(e) => setSelectedFlat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-50 focus:border-[#5842F4] transition-all cursor-pointer text-slate-700"
              >
                <option value="">Select Flat</option>
                {flats.map((flat) => (
                  <option key={flat.id || flat.flat_number} value={flat.flat_number}>
                    {flat.flat_number}
                  </option>
                ))}
              </select>
            </div>

            {/* Owner Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
                <User size={14} /> Owner Name
              </label>
              <input 
                type="text" 
                placeholder="Auto-filled" 
                value={ownerName}
                readOnly
                disabled
                className="w-full bg-slate-50 border border-slate-50 rounded-xl py-3 px-4 text-slate-400 italic outline-none"
              />
            </div>

            {/* For Month */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
                <Calendar size={14} /> For Month
              </label>
              <div className="flex gap-2">
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-2/3 bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-[#5842F4] transition-all text-slate-700"
                >
                  <option value="">Select Month</option>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input 
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-1/3 bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-[#5842F4] transition-all text-slate-700"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
                <Banknote size={14} /> Amount (₹)
              </label>
              <input 
                type="number" 
                placeholder="2500" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-[#5842F4] transition-all text-indigo-600 font-bold"
              />
            </div>

            {/* Payment Mode Selector */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
                <CreditCard size={14} /> Payment Mode
              </label>
              <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl">
                {['Cash', 'UPI', 'Bank'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      paymentMode === mode 
                        ? 'bg-white text-[#5842F4] shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
                <Calendar size={14} /> Transaction Date
              </label>
              <input 
                type="date" 
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-[#5842F4] transition-all text-slate-700"
              />
            </div>
          </div>

          {/* Transaction ID */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
              <FileText size={14} /> Transaction ID (Optional)
            </label>
            <input 
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. TXN123456789 (Leave blank to auto-generate)"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-[#5842F4] transition-all text-sm"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-6 pt-4">
            <button 
              type="button" 
              onClick={handleReset}
              className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              <RotateCcw size={16} /> Reset
            </button>
            <button 
              type="submit" 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#5842F4] text-white px-10 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 hover:bg-[#4a35e0] transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Save size={18} /> {isSubmitting ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}