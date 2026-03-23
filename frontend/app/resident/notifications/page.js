"use client";
import React, { useEffect, useState } from "react";
import { Bell, BellRing, Clock, Megaphone, RefreshCw } from "lucide-react";
import axios from "axios";

export default function ResidentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/resident`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Unable to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  function timeAgo(dateStr) {
    const now = new Date();
    const then = new Date(dateStr);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return then.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatFullDate(dateStr) {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="bg-[#5842F4] p-2 rounded-xl text-white">
              <Bell size={20} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Notifications
            </h1>
          </div>
          <p className="text-slate-500 text-sm pl-1">
            Announcements and updates from the society admin.
          </p>
        </div>

        <button
          onClick={fetchNotifications}
          disabled={loading}
          className="flex items-center gap-2 text-[#5842F4] text-xs font-bold bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all border border-indigo-100 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Badge count */}
      {!loading && !error && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            {notifications.length}{" "}
            {notifications.length === 1 ? "notification" : "notifications"}
          </span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse space-y-3"
            >
              <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
              <div className="h-3 bg-slate-100 rounded-lg w-full" />
              <div className="h-3 bg-slate-100 rounded-lg w-4/5" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center space-y-3">
          <BellRing size={36} className="text-red-300 mx-auto" />
          <p className="text-red-600 font-semibold text-sm">{error}</p>
          <button
            onClick={fetchNotifications}
            className="text-xs font-bold text-[#5842F4] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 flex flex-col items-center gap-4 shadow-sm">
          <div className="bg-slate-50 p-5 rounded-full border border-slate-100">
            <Bell size={36} className="text-slate-300" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-black text-slate-700">No notifications yet</p>
            <p className="text-slate-400 text-sm">
              Society announcements and alerts will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif, index) => (
            <div
              key={notif.id}
              onClick={() => handleMarkAsRead(notif.id, notif.is_read)}
              className={`rounded-2xl border ${notif.is_read ? 'bg-white border-slate-100' : 'bg-indigo-50/30 border-indigo-200'} shadow-sm p-6 hover:shadow-md transition-all group relative overflow-hidden cursor-pointer`}
            >
              {/* Accent bar */}
              {!notif.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-l-2xl" />}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5842F4] rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 bg-indigo-50 border border-indigo-100 p-2 rounded-xl text-[#5842F4]">
                    <Megaphone size={16} />
                  </div>
                  <h3 className="font-black text-slate-800 text-sm leading-snug">
                    {notif.title}
                  </h3>
                </div>
                <span className="shrink-0 text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                  {timeAgo(notif.created_at)}
                </span>
              </div>

              {/* Message body */}
              <p className="text-sm text-slate-500 leading-relaxed ml-11">
                {notif.content}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 ml-11">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Clock size={11} />
                  {formatFullDate(notif.created_at)}
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                  From: {notif.sent_by}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
