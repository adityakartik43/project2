'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Wallet, Send, Building, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/StatCard';

const Dashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalFlats: 0,
    paidFlats: 0,
    pendingFlats: 0,
    totalCollected: 0
  });
  const [chartData, setChartData] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get current month string for display
  const currentMonth = new Date().toLocaleString('default', { month: 'short' });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          const d = res.data.data;
          setStats({
            totalFlats: d.totalFlats,
            paidFlats: d.paidFlats,
            pendingFlats: d.pendingFlats,
            totalCollected: d.totalCollected
          });
          // Reverse order to show oldest to newest left to right
          setChartData(d.barChartData.slice().reverse());
          setPendingList(d.pendingList);
          setRecentRecords(d.recentRecords);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-500 animate-pulse text-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-3">
        <button 
          onClick={() => router.push('/admin/flats')}
          className="bg-[#5842F4] text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-[#4a35e0] transition-all"
        >
          <Plus size={18} /> Add Flat
        </button>
        <button 
          onClick={() => router.push('/admin/payments')}
          className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-50 transition-all"
        >
          <Wallet size={18} /> Record Payment
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Flats" value={stats.totalFlats} color="text-blue-600" icon={Building} />
        <StatCard title={`Paid (${currentMonth})`} value={stats.paidFlats} color="text-green-600" icon={CheckCircle} />
        <StatCard title="Pending" value={stats.pendingFlats} color="text-red-500" icon={AlertCircle} />
        <StatCard title="Total Collected" value={`₹${stats.totalCollected.toLocaleString()}`} color="text-indigo-600" icon={CreditCard} />
      </div>

      {/* Charts & Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Overview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-800">Collection Overview</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Collected']}
                />
                <Bar dataKey="amount" fill="#5842F4" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Payments Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6">Pending Payments</h3>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-50">
                <tr>
                  <th className="pb-3">Flat</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.length > 0 ? (
                  pendingList.slice(0, 5).map((pending, idx) => (
                    <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-bold text-slate-700">{pending.flat_number}</td>
                      <td className="py-3 text-right font-bold text-red-500">₹{pending.amount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="py-6 text-center text-slate-400 italic text-xs">No pending dues!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button className="mt-4 text-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
            View All Pending
          </button>
        </div>
      </div>

      {/* Recent Records Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Recent Payment Records</h3>
          <button className="text-xs font-bold text-indigo-600 hover:underline">Download CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-6 py-4">Flat & Owner</th>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.length > 0 ? (
                recentRecords.map((record, idx) => (
                  <tr key={idx} className="border-t border-slate-50 text-slate-600 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{record.flat_number}</p>
                      <p className="text-xs text-slate-400">{record.owner_name}</p>
                    </td>
                    <td className="px-6 py-4 capitalize font-medium text-slate-500">{record.payment_month}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 uppercase text-[10px] font-bold text-slate-500 tracking-wider rounded">
                        {record.payment_mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(record.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-[#5842F4]">
                      ₹{record.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                        <CheckCircle size={14} /> Completed
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-slate-50 text-slate-500">
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-300 italic">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;