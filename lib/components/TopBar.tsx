"use client";

import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 md:px-8 py-3 md:py-4 transition-all duration-300">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu for Mobile */}
        <button 
          onClick={onMenuClick}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100/50 hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <span className="text-xl">☰</span>
        </button>

        <div className="md:hidden flex items-center gap-2 text-lg font-bold text-[#0A2463]">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A2463]/10">
            <span className="text-sm">⚡</span>
          </div>
          <span className="hidden sm:inline">Power</span>
        </div>
      </div>

      <div className="hidden md:block" />
      
      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex flex-col items-end">
          <span className="text-[10px] md:text-[11px] uppercase tracking-wider text-gray-400 font-bold leading-none mb-1">
            Utilisateur
          </span>
          <span className="text-xs md:text-sm font-medium text-gray-700 max-w-[120px] md:max-w-none truncate">
            {user?.email ?? "—"}
          </span>
        </div>
        
        <div className="h-8 w-[1px] bg-gray-200 hidden sm:block" />
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold cursor-pointer whitespace-nowrap"
        >
          <span className="text-lg">🚪</span>
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
