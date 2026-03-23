'use client'

import React, { useState, useEffect } from "react";
import { Settings2, Info, Clock, Banknote, Edit3, X, Save } from "lucide-react";
import axios from "axios";

export default function Subscriptions() {
  const [plans, setPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editFee, setEditFee] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch subscriptions from the backend
  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/subscriptions/get-subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Calculate projected revenue based on fetched plans
  // Note: Since 'linked_flats' count isn't in the subscriptions table, we are assuming 0 for now unless added later.
  const projectedRevenue = plans.reduce((acc, plan) => {
    // Assuming you might add a 'linked_flats' count to the backend later. For now, we'll just sum the raw fees for demo purposes.
    // In a real scenario, you'd multiply fee * number of flats of that type.
    return acc + Number(plan.monthly_fee || 0);
  }, 0);

  const handleEditClick = (plan) => {
    setEditingPlan(plan.id);
    setEditFee(plan.monthly_fee);
  };

  const handleSaveClick = async (plan) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/subscriptions/maintenance`, {
        flatType: plan.flat_type,
        price: editFee
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setEditingPlan(null);
        fetchSubscriptions();
      }
    } catch (error) {
      console.error("Error saving subscription:", error);
      alert("Failed to update subscription fee.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings2 className="text-[#5842F4] w-6 h-6" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Subscription Plans
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            Configure monthly maintenance fees across different flat categories.
          </p>
        </div>

        {/* Projected Revenue Card */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-4 min-w-[280px]">
          <div className="bg-[#5842F4] p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
            <Banknote size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              Total Plan Types Fee
            </p>
            <p className="text-2xl font-black text-slate-800">₹{projectedRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Info Callout */}
      <div className="bg-blue-50/50 border-l-4 border-blue-500 p-6 rounded-r-2xl flex gap-4 items-start">
        <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
          <Info size={18} />
        </div>
        <div>
          <h4 className="text-blue-900 font-bold text-sm">Important Note</h4>
          <p className="text-blue-700/80 text-sm mt-0.5">
            Updating the monthly fee applies to{" "}
            <span className="font-bold">all flats</span> in that category.
            Changes take effect from the next billing cycle.
          </p>
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/30">
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold border-b border-slate-100">
                <th className="px-10 py-5">Flat Type</th>
                <th className="px-10 py-5">Monthly Fee</th>
                <th className="px-10 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {plans.length > 0 ? (
                plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-10 py-6">
                      <span className="font-bold text-slate-800">
                        {plan.flat_type}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      {editingPlan === plan.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-extrabold text-[#5842F4]">₹</span>
                          <input
                            type="number"
                            value={editFee}
                            onChange={(e) => setEditFee(e.target.value)}
                            className="bg-white border rounded-lg px-3 py-1.5 w-24 text-lg font-extrabold text-[#5842F4] outline-none focus:border-[#5842F4] shadow-sm ml-1"
                          />
                        </div>
                      ) : (
                        <span className="text-lg font-extrabold text-[#5842F4]">
                          ₹ {plan.monthly_fee}
                        </span>
                      )}
                    </td>
                    <td className="px-10 py-6 text-right">
                      {editingPlan === plan.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingPlan(null)}
                            disabled={loading}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                          <button
                            onClick={() => handleSaveClick(plan)}
                            disabled={loading}
                            className="flex items-center gap-1.5 bg-[#5842F4] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-[#4a35e0] transition-all disabled:opacity-50"
                          >
                            <Save size={16} /> {loading ? "Saving..." : "Save"}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(plan)}
                          className="bg-white border border-slate-200 text-slate-700 px-4 py-2 flex items-center gap-2 ml-auto rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
                        >
                          <Edit3 size={16} /> Edit Plan
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-10 py-8 text-center text-slate-400 italic font-medium">No subscription plans found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
