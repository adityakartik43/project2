"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    console.log(user.role)

    if (!token || user.role == "resident") {
      router.push("/admin/login");
    }
  }, []);

  return children;
}