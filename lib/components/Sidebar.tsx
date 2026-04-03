"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Tableau de bord", icon: "📊" },
  { href: "/flotte", label: "Flotte", icon: "🚗" },
  { href: "/commandes", label: "Commandes", icon: "📦" },
  { href: "/facturation", label: "Facturation", icon: "💶" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-[#0A2463] text-white">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
        <span className="text-2xl font-bold tracking-wide">⚡ Power</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-white/15 text-white font-semibold"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-white/10 text-xs text-white/40">
        Power Portal v0.1
      </div>
    </aside>
  );
}
