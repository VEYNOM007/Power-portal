"use client";

import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";

export default function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3">
      <div className="md:hidden text-lg font-bold text-[#0A2463]">⚡ Power</div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user?.email ?? "—"}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800 font-medium cursor-pointer"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
