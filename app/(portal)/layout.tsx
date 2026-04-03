"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/lib/components/Sidebar";
import TopBar from "@/lib/components/TopBar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A2463]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="md:pl-60 min-h-screen">
      <Sidebar />
      <TopBar />
      <main className="p-6">{children}</main>
    </div>
  );
}
