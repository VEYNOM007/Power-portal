"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCompany } from "@/lib/hooks/useCompany";
import { formatDate, daysSince } from "@/lib/utils/weekLabel";
import StatusBadge from "@/lib/components/ui/StatusBadge";
import SkeletonRow from "@/lib/components/ui/SkeletonRow";

type VehicleStatus = "ok" | "alert" | "never";

function getVehicleStatus(lastDeliveryAt: Date | null): VehicleStatus {
  if (!lastDeliveryAt) return "never";
  const days = daysSince(lastDeliveryAt);
  if (days === null) return "never";
  return days > 5 ? "alert" : "ok";
}

export default function FlottePage() {
  const { vehicles, loading } = useCompany();
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");

  const departments = useMemo(() => {
    const depts = new Set(vehicles.map((v) => v.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [vehicles]);

  const filtered = useMemo(() => {
    let list = [...vehicles];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.plate.toLowerCase().includes(q) ||
          (v.assignedDriverName ?? "").toLowerCase().includes(q)
      );
    }
    if (filterDept) {
      list = list.filter((v) => v.department === filterDept);
    }
    return list.sort((a, b) => {
      const aTime = a.lastDeliveryAt?.getTime() ?? 0;
      const bTime = b.lastDeliveryAt?.getTime() ?? 0;
      return aTime - bTime;
    });
  }, [vehicles, search, filterDept]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A2463] mb-6">Flotte</h1>

      {/* Barre de recherche + filtre */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Rechercher (immatriculation, chauffeur)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
        />
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
        >
          <option value="">Tous les départements</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-6 py-3 font-medium">Immatriculation</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Département</th>
              <th className="px-6 py-3 font-medium">Capacité</th>
              <th className="px-6 py-3 font-medium">Chauffeur</th>
              <th className="px-6 py-3 font-medium">Dernier plein</th>
              <th className="px-6 py-3 font-medium">Statut</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={8} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                  Aucun véhicule dans votre flotte
                </td>
              </tr>
            ) : (
              filtered.map((v) => {
                const vs = getVehicleStatus(v.lastDeliveryAt);
                return (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{v.plate}</td>
                    <td className="px-6 py-3 text-gray-600">{v.fuelType}</td>
                    <td className="px-6 py-3 text-gray-600">{v.department || "—"}</td>
                    <td className="px-6 py-3 text-gray-600">
                      {v.tankCapacityLiters ? `${v.tankCapacityLiters} L` : "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{v.assignedDriverName || "—"}</td>
                    <td className="px-6 py-3 text-gray-600">{formatDate(v.lastDeliveryAt)}</td>
                    <td className="px-6 py-3">
                      {vs === "ok" && <StatusBadge label="OK" color="green" />}
                      {vs === "alert" && <StatusBadge label="Alerte" color="orange" />}
                      {vs === "never" && <StatusBadge label="Jamais livré" color="gray" />}
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/commandes?vehicleId=${v.id}&plate=${v.plate}`}
                        className="text-sm font-medium text-[#FF6B35] hover:underline"
                      >
                        Commander
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
