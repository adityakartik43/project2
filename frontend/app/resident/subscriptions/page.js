"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from 'axios';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  History,
  Clock,
} from "lucide-react";

export default function ResidentSubscriptionsList() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        
        const user = JSON.parse(userStr);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/resident-subscriptions/history/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setHistory(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch billing history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#5842F4]/10 p-2.5 rounded-xl text-[#5842F4]">
                <History className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Billing History
              </h1>
            </div>
            <p className="text-slate-500 text-base max-w-xl font-medium">
              View your past maintenance bills. Click on any month to see a
              detailed breakdown of the charges and download your receipt.
            </p>
          </div>
        </div>

        {/* History Table/List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/30">
                <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold border-b border-slate-100">
                  <th className="px-10 py-5 w-[35%]">Billing Month</th>
                  <th className="px-10 py-5">Amount Billed</th>
                  <th className="px-10 py-5">Status</th>
                  <th className="px-10 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5842F4]"></div>
                        <p className="text-slate-500 font-medium italic">Loading history...</p>
                      </div>
                    </td>
                  </tr>
                ) : history.length > 0 ? (
                  history.map((record) => (
                    <tr key={record.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl flex-shrink-0 transition-all duration-300
                            ${record.status === "PAID" ? "bg-indigo-50 text-indigo-500 group-hover:bg-[#5842F4] group-hover:text-white" : record.status === "PARTIAL" ? "bg-amber-50 text-amber-500" : "bg-red-50 text-red-500"}
                          `}>
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-base">{record.title}</p>
                            <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                              <Clock size={12} />
                              {record.status === "PAID" ? `Paid on ${record.date}` : record.status === "PARTIAL" ? `Partially paid on ${record.date}` : "Payment Pending"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-slate-800 tracking-tight">₹{record.amount}</span>
                          {record.status === "PARTIAL" && (
                            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Paid: ₹{record.paid_amount}</span>
                          )}
                        </div>
                      </td>

                      <td className="px-10 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider
                          ${record.status === "PAID" ? "bg-green-50 text-green-600 border-green-100" : record.status === "PARTIAL" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-red-50 text-red-600 border-red-100"}
                        `}>
                          {record.status === "PAID" ? <CheckCircle2 size={12} strokeWidth={3} /> : record.status === "PARTIAL" ? <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> : <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                          {record.status}
                        </span>
                      </td>

                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {record.status === "PAID" && (
                            <button className="text-slate-400 hover:text-[#5842F4] transition-all p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 hidden md:flex items-center justify-center">
                              <Download size={18} />
                            </button>
                          )}
                          <Link href={`/resident/subscriptions/${record.id}`} className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm group-hover:shadow-indigo-100">
                            View Details <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-10 py-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-300 italic">
                        <Calendar size={48} strokeWidth={1} />
                        <p className="text-sm">No billing history found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}