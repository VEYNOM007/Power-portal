"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Tableau de bord", icon: "📊" },
  { href: "/flotte", label: "Flotte", icon: "🚗" },
  { href: "/commandes", label: "Commandes", icon: "📦" },
  { href: "/facturation", label: "Facturation", icon: "💶" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 flex-col bg-gradient-to-b from-[#0A2463] to-[#05143A] text-white z-[70] overflow-y-auto border-r border-white/5 transition-transform duration-300 ease-in-out
        w-64 md:translate-x-0
        ${isOpen ? "translate-x-0 flex" : "-translate-x-full hidden md:flex"}
      `}>
        <div className="flex items-center justify-between px-8 py-7 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm">
              <span className="text-xl">⚡</span>
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Power</span>
          </div>
          
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="md:hidden text-white/50 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={onClose}
                className={`group flex items-center gap-4 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-white/10 text-white shadow-lg shadow-black/10 ring-1 ring-white/10"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                }`}
              >
                <span className={`transition-transform duration-200 group-hover:scale-110 ${active ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                  {l.icon}
                </span>
                {l.label}
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-6 border-t border-white/5">
          <div className="px-4 py-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-1">Version</p>
            <p className="text-xs text-white/60">Power Portal v0.1.0-beta</p>
          </div>
        </div>
      </aside>
    </>
  );
}
