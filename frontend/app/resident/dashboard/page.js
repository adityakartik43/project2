"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  CreditCard, FileText, Calendar, Building2, 
  Wallet, CheckCircle2, AlertCircle, ChevronRight
} from 'lucide-react';

export default function ResidentOverview() {
  const [data, setData] = useState({
    flatNumber: '...',
    flatType: '...',
    totalAmount: 0,
    outstandingAmount: 0,
    recentPayments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve user context from localStorage or token
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        
        const user = JSON.parse(userStr);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/resident-dashboard/stats/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="mx-auto my-10">
      
      {/* Top Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ResidentStat title="Flat Number" value={data.flatNumber} icon={Building2} color="text-indigo-600" />
        <ResidentStat title="Subscription Type" value={data.flatType} icon={FileText} color="text-indigo-600" />
        <ResidentStat title={`Total Paid (${new Date().getFullYear()})`} value={`₹${data.totalAmount}`} icon={CheckCircle2} color="text-green-600" bg="bg-green-50/50" />
        <ResidentStat title="Outstanding" value={`₹${data.outstandingAmount}`} icon={AlertCircle} color={data.outstandingAmount > 0 ? "text-red-500" : "text-slate-400"} />
      </div>

      {/* Recent Payment History */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mt-6">
        <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Recent Payment History</h3>
          <button className="text-[#5842F4] text-xs font-bold flex items-center gap-1 hover:underline underline-offset-4">
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/30">
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold border-b border-slate-50">
                <th className="px-10 py-5">Billing Month</th>
                <th className="px-10 py-5">Amount</th>
                <th className="px-10 py-5">Mode</th>
                <th className="px-10 py-5">Status</th>
                <th className="px-10 py-5 text-right">Transaction Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.recentPayments.length > 0 ? (
                data.recentPayments.map((row, i) => (
                  <tr key={i} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                          <Calendar size={16} />
                        </div>
                        <span className="font-bold text-slate-700 capitalize">{row.month}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 font-black text-slate-800">₹{row.amount}</td>
                    <td className="px-10 py-6 text-slate-400 text-sm font-medium uppercase">{row.mode}</td>
                    <td className="px-10 py-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-[10px] font-black text-green-600 border border-green-100">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> {row.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[13px] text-slate-400 font-medium">{row.date}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-10 py-8 text-center text-slate-500 font-medium">
                    {loading ? "Loading..." : "No recent payments found."}
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

function ResidentStat({ title, value, icon: Icon, color, bg = "bg-white" }) {
  return (
    <div className={`${bg} p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all`}>
      <div className="space-y-1">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{title}</p>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-xl bg-white border border-slate-100 shadow-sm ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={22} />
      </div>
    </div>
  );
}