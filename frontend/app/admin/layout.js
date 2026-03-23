"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/utils/AdminAuthGuard.js";

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // If we are on the login page, don't show the dashboard layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar - Width changes based on state */}
      <Sidebar isCollapsed={isCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar - Receives the toggle function */}
        <Navbar toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto">
            <AuthGuard>
            {children}
            </AuthGuard>
          </div>
        </main>
      </div>
    </div>
  );
}
