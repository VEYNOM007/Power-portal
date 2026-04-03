"use client";

import { useCompany } from "@/lib/hooks/useCompany";

export default function DashboardPage() {
  const { company, vehicleCount, loading } = useCompany();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A2463]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A2463] mb-6">
        Tableau de bord
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Entreprise</p>
          <p className="text-lg font-semibold">{company?.name ?? "—"}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Véhicules</p>
          <p className="text-3xl font-bold text-[#00A651]">{vehicleCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Statut</p>
          <p className="text-lg font-semibold">
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                company?.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {company?.status === "active" ? "Actif" : "Suspendu"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
