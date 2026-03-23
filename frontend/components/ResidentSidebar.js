"use client";

import Link from "next/link";
import {
  Building2,
  LayoutDashboard,
  CreditCard,
  User2Icon,
  BellIcon,
  SubscriptIcon,
  Subscript,
  Ticket,
} from "lucide-react";
import { usePathname } from "next/navigation";

const ResidentSidebar = ({ isCollapsed }) => {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/resident/dashboard" },
    {
      icon: Ticket,
      label: "Subscriptions",
      href: "/resident/subscriptions",
    },
    { icon: CreditCard, label: "Pay Bill", href: "/resident/pay-bill" },
    { icon: User2Icon, label: "Profile", href: "/resident/profile" },
    { icon: BellIcon, label: "Notifications", href: "/resident/notifications" },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-100 transition-all duration-300 flex flex-col p-4 z-50 
      ${isCollapsed ? "w-20" : "w-72"}`}
    >
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-2 mb-10 mt-2 overflow-hidden">
        <div className="bg-[#5842F4] p-2 rounded-xl text-white shrink-0">
          <Building2 size={24} />
        </div>
        {!isCollapsed && (
          <span className="text-2xl font-bold text-[#1E293B]">SocietyPro</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl
                ${active ? "bg-[#5842F4] text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <item.icon size={22} className="shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-20 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default ResidentSidebar;
