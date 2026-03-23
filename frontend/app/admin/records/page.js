"use client";
import React, { useState, useEffect } from "react";
import {
  History,
  Download,
  Search,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Calendar,
  Filter,
} from "lucide-react";
import RecordStat from "@/components/RecordStatsCard.js";
import axios from 'axios';

export default function MonthlyRecords() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [monthOptions, setMonthOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalFlats: 0,
    paidFlats: 0,
    pendingFlats: 0,
    totalCollected: 0
  });
  const [records, setRecords] = useState([]);

  // Initialize month options
  useEffect(() => {
    const options = [];
    const now = new Date();
    // Generate last 12 months including current
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        options.push({
            label: `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`,
            val: d
        });
    }
    setMonthOptions(options);

    // Default to current month
    setSelectedMonth(now.toLocaleString('default', { month: 'long' }));
    setSelectedYear(now.getFullYear().toString());
  }, []);

  // Fetch data when month/year changes
  useEffect(() => {
    if (!selectedMonth || !selectedYear) return;

    const fetchRecords = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/records/card-values?month=${selectedMonth}&year=${selectedYear}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if(res.data.success) {
            setStats(res.data.data.stats);
            setRecords(res.data.data.records);
        }
      } catch (err) {
        console.error("Failed to fetch monthly records:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [selectedMonth, selectedYear]);

  const handleMonthChange = (e) => {
    const val = e.target.value; // e.g. "March 2026"
    const [m, y] = val.split(" ");
    setSelectedMonth(m);
    setSelectedYear(y);
  };

  const filteredRecords = records.filter(r => 
    r.flat_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="text-[#5842F4] w-6 h-6" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Monthly Subscription Records
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            Track maintenance collections and pending dues for the society.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm">
            <Calendar size={16} className="text-slate-400" />
            <select 
              value={`${selectedMonth} ${selectedYear}`} 
              onChange={handleMonthChange}
              className="text-sm font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
            >
              {monthOptions.map(opt => (
                <option key={opt.label} value={opt.label}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <RecordStat
          title="Total Flats"
          value={stats.totalFlats}
          icon={LayoutGrid}
          color="text-slate-600"
          bg="bg-white"
        />
        <RecordStat
          title="Paid"
          value={stats.paidFlats}
          icon={CheckCircle2}
          color="text-green-500"
          bg="bg-green-50/50"
          border="border-green-100"
        />
        <RecordStat
          title="Pending"
          value={stats.pendingFlats}
          icon={AlertCircle}
          color="text-red-500"
          bg="bg-red-50/50"
          border="border-red-100"
        />
        <RecordStat
          title="Total Collected"
          value={`₹${stats.totalCollected.toLocaleString()}`}
          icon={CreditCard}
          color="text-[#5842F4]"
          bg="bg-indigo-50/50"
          border="border-indigo-100"
        />
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#5842F4]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search flat or owner name..."
            className="w-full bg-slate-50 border border-slate-50 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-50 focus:border-[#5842F4] text-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider px-2">
          <Filter size={16} />
          Showing results for {selectedMonth} {selectedYear}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/30">
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold border-b border-slate-100">
                <th className="px-8 py-5">Flat Number</th>
                <th className="px-8 py-5">Owner</th>
                <th className="px-8 py-5 text-center">Amount</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-center">Payment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                   <td colSpan="6" className="px-8 py-24 text-center">
                    <p className="text-slate-500 animate-pulse text-sm font-medium">Loading records...</p>
                   </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 font-bold text-slate-700">{record.flat_number}</td>
                    <td className="px-8 py-4 font-medium text-slate-600">{record.owner_name}</td>
                    <td className="px-8 py-4 text-center">
                      {record.status === 'Paid' ? (
                        <span className="font-bold text-green-600">₹{record.amount_paid}</span>
                      ) : (
                        <span className="font-bold text-red-500">₹{record.expected_amount}</span>
                      )}
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        record.status === 'Paid' 
                          ? 'bg-green-50 text-green-600 border border-green-100' 
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {record.status === 'Paid' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {record.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-center text-sm font-medium text-slate-400">
                      {record.status === 'Paid' && record.transaction_date ? new Date(record.transaction_date).toLocaleDateString() : '-'}
                    </td>
                    
                  </tr>
                ))
              ) : (
                <tr className="border-b border-slate-50">
                  <td colSpan="6" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <History size={48} strokeWidth={1} />
                      <p className="italic text-sm">
                        No subscription records found for this period
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
