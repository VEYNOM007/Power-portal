"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/lib/components/Sidebar";
import TopBar from "@/lib/components/TopBar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Fermer la sidebar quand on change de route (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-t-2 border-b-2 border-[#0A2463] animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="text-xl">⚡</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-8 lg:p-10 animate-in fade-in duration-700">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        <footer className="px-8 py-6 text-center text-xs text-gray-400 font-medium">
          &copy; 2026 Power - Solutions de Carburant B2B
        </footer>
      </div>
    </div>
  );
}
