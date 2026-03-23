"use client";
import React, { useState, useEffect } from "react";
import { Bell, Megaphone, Send, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import axios from "axios";

export default function Notifications() {
  const today = new Date();
  const defaultDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  const [date, setDate] = useState(defaultDate);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success'|'error', text: string }
  const [notifications, setNotifications] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setStatusMsg({ type: "error", text: "Please fill in all fields." });
      return;
    }
    setSending(true);
    setStatusMsg(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/send`,
        { title, message, date },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setStatusMsg({ type: "success", text: "Notification broadcast successfully!" });
        setTitle("");
        setMessage("");
        fetchNotifications();
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Failed to send notification. Please try again." });
    } finally {
      setSending(false);
    }
  };

  function timeAgo(dateStr) {
    const now = new Date();
    const then = new Date(dateStr);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return then.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Bell className="text-[#5842F4] w-6 h-6" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Communications &amp; Notifications
          </h1>
        </div>
        <p className="text-slate-500 text-sm">
          Broadcast announcements or automated payment reminders to all residents.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Broadcast Form */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10 space-y-6">
          <div className="flex items-center gap-2 text-[#5842F4]">
            <Megaphone size={20} strokeWidth={2.5} />
            <h3 className="font-bold text-slate-800">New Broadcast</h3>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Status message */}
            {statusMsg && (
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                  statusMsg.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100"
                }`}
              >
                {statusMsg.type === "success" ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                {statusMsg.text}
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
                Notification Title
              </label>
              <input
                type="text"
                placeholder="e.g. Water Supply Interruption"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:bg-white focus:border-[#5842F4] transition-all"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
                Select Date
              </label>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 w-fit">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
                Message Content
              </label>
              <textarea
                rows="5"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:bg-white focus:border-[#5842F4] transition-all resize-none text-sm"
              />
            </div>

            {/* Footer */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase italic">
                <Clock size={14} /> Sent immediately upon submission
              </div>
              <button
                type="submit"
                disabled={sending}
                className="bg-[#5842F4] text-white px-10 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:bg-[#4a35e0] transition-all transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                {sending ? "Sending..." : "Send Broadcast"}
              </button>
            </div>
          </form>
        </div>

        {/* Sent Notifications List */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#5842F4]">
              <Bell size={20} strokeWidth={2.5} />
              <h3 className="font-bold text-slate-800">Sent Broadcasts</h3>
            </div>
            <span className="text-xs text-slate-400 font-bold bg-slate-50 px-3 py-1 rounded-full">
              {notifications.length} total
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[480px] pr-1">
            {loadingList ? (
              <div className="flex items-center justify-center h-40 text-slate-400 text-sm font-medium">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                <Bell size={32} strokeWidth={1.5} />
                <p className="text-sm font-medium">No broadcasts sent yet.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-sm font-bold text-slate-800 leading-snug">{notif.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap bg-white border border-slate-100 px-2 py-1 rounded-full">
                      {timeAgo(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{notif.content}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-wider">
                    By {notif.sent_by}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
