"use client"

import { useState } from "react"
import ResidentSidebar from "@/components/ResidentSidebar"
import { usePathname } from "next/navigation"
import AuthGuard from "@/utils/ResidentAuthGuard"
import Navbar from "@/components/Navbar.js"

const ResidentLayout = ({ children }) => {

  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const pathname = usePathname();

  if(pathname === "/resident/login"){
    return <>{children}</>
  }

  return (
    <>
    <div className="flex h-screen bg-white overflow-hidden">

    <ResidentSidebar isCollapsed={isCollapsed} />
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Navbar - Receives the toggle function */}
      <Navbar toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />

      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        <div className="mx-auto h-full">
          <AuthGuard>
          {children}
          </AuthGuard>
        </div>
      </main>
    </div>

    </div>
    </>
  )
}

export default ResidentLayout
