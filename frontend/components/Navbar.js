"use client";
import { useState, useEffect } from "react";
import { Bell, Menu, X, User2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Navbar({ toggleSidebar, isCollapsed }) {
  const router = useRouter();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/notifications/has-unread`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setHasUnread(res.data.data.hasUnread);
        }
      } catch (err) {
        console.error("Failed to fetch unread status", err);
      }
    };
    fetchUnread();
  }, []);
  const gotoProfile = () => {
    router.push("/resident/profile");
  };
  const gotoNotifications = () => {
    router.push("/resident/notifications");
  };
  return (
    <nav className="h-16 border-b border-slate-100 bg-white flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Hamburger Toggle */}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"
        >
          {isCollapsed ? <Menu size={24} /> : <X size={24} />}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full"
          onClick={gotoNotifications}
        >
          <Bell size={20} />
          {hasUnread && (
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-yellow-400 rounded-full" />
          )}
        </button>
        <div
          className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-[#5842F4] font-bold text-xs cursor-pointer hover:bg-indigo-200 transition-colors"
          onClick={gotoProfile}
        >
          <User2Icon />
        </div>
      </div>
    </nav>
  );
}
