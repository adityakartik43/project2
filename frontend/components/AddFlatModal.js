"use client";
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

export default function AddFlatModal({ isOpen, onClose, mode = "add", initialFlatNo = "", onSuccess }) {
  const [formData, setFormData] = useState({
    flatNo: '',
    role: 'resident',
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        flatNo: initialFlatNo || '',
        role: 'resident',
        name: '',
        email: '',
        phone: '',
      });
    }
  }, [isOpen, initialFlatNo, mode]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === "add" ? "/users/register" : "/users/edit-owner";
      const method = mode === "add" ? "post" : "put";

      const token = localStorage.getItem("token");
      await axios[method](`${process.env.NEXT_PUBLIC_BASE_URL}${endpoint}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
          <h2 className="text-xl font-bold text-slate-800">
            {mode === "add" ? "Add New Flat" : "Edit Flat Owner"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Top Row: Flat No, Type, Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Flat Number</label>
              <input 
                name="flatNo"
                value={formData.flatNo}
                onChange={handleChange}
                type="text" 
                placeholder="e.g. A-101"
                required
                readOnly={mode === "edit"}
                className={`w-full border border-slate-200 rounded-xl py-2.5 px-4 outline-none text-sm transition-all ${mode === "edit" ? "bg-slate-50 text-slate-500 cursor-not-allowed" : "bg-white focus:border-[#5842F4]"}`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#5842F4] text-sm transition-all appearance-none cursor-pointer">
                <option value="resident">Resident</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Owner Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Owner Name</label>
            <input 
              name="name"
              value={formData.name}
              onChange={handleChange}
              type="text" 
              placeholder="Full Name"
              required
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#5842F4] text-sm transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
            <input 
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email" 
              placeholder="name@email.com"
              required
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#5842F4] text-sm transition-all"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Phone Number</label>
            <input 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              type="tel" 
              placeholder="+91 00000 00000"
              required
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:border-[#5842F4] text-sm transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="bg-[#5842F4] text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-[#4a35e0] transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : mode === "add" ? "Register Flat" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}