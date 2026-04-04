"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCompany } from "@/lib/hooks/useCompany";
import { formatDate, daysSince } from "@/lib/utils/weekLabel";
import StatusBadge from "@/lib/components/ui/StatusBadge";
import { Vehicle } from "@/lib/firebase/firestore";

type VehicleStatus = "ok" | "alert" | "never";

function getVehicleStatus(lastDeliveryAt: Date | null): VehicleStatus {
  if (!lastDeliveryAt) return "never";
  const days = daysSince(lastDeliveryAt);
  if (days === null) return "never";
  return days > 5 ? "alert" : "ok";
}

// Composant interne pour l'affichage en carte sur Mobile
function VehicleCard({ vehicle, status }: { vehicle: Vehicle, status: VehicleStatus }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#0A2463] mb-0.5">{vehicle.plate}</h3>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{vehicle.fuelType}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {status === "ok" && <StatusBadge label="OK" color="green" />}
          {status === "alert" && <StatusBadge label="Alerte" color="orange" />}
          {status === "never" && <StatusBadge label="Jamais livré" color="gray" />}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
        <div className="bg-gray-50/50 p-2.5 rounded-xl">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Kilométrage</p>
          <p className="font-medium text-gray-700">{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : "—"}</p>
        </div>
        <div className="bg-gray-50/50 p-2.5 rounded-xl">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Département</p>
          <p className="font-medium text-gray-700">{vehicle.department || "—"}</p>
        </div>
        <div className="bg-gray-50/50 p-2.5 rounded-xl">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Capacité</p>
          <p className="font-medium text-gray-700">{vehicle.tankCapacityLiters ? `${vehicle.tankCapacityLiters} L` : "—"}</p>
        </div>
        <div className="bg-gray-50/50 p-2.5 rounded-xl flex flex-col justify-center">
           <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Chauffeur</p>
           <p className="text-xs font-medium text-gray-600 truncate">{vehicle.assignedDriverName || "—"}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Dernier plein</p>
          <p className="text-xs font-medium text-gray-600">{formatDate(vehicle.lastDeliveryAt)}</p>
        </div>
        <Link
          href={`/commandes?vehicleId=${vehicle.id}&plate=${vehicle.plate}`}
          className="px-4 py-2 bg-[#FF6B35]/10 text-[#FF6B35] rounded-xl text-xs font-bold hover:bg-[#FF6B35] hover:text-white transition-all duration-200"
        >
          Commander
        </Link>
      </div>
    </div>
  );
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2463]">Flotte</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos véhicules et suivez leur consommation.</p>
        </div>
        <div className="flex gap-2">
            <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                <p className="text-[10px] text-blue-400 font-bold uppercase mb-0.5">Total</p>
                <p className="text-lg font-bold text-blue-700 leading-none">{vehicles.length}</p>
            </div>
            <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                <p className="text-[10px] text-orange-400 font-bold uppercase mb-0.5">Alertes</p>
                <p className="text-lg font-bold text-orange-700 leading-none">
                    {vehicles.filter(v => getVehicleStatus(v.lastDeliveryAt) === "alert").length}
                </p>
            </div>
        </div>
      </div>

      {/* Barre de recherche + filtre - Premium Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        <div className="md:col-span-8 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Rechercher par immatriculation ou chauffeur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200 placeholder:text-gray-400"
          />
        </div>
        <div className="md:col-span-4 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200 appearance-none text-gray-600 font-medium"
          >
            <option value="">Tous les départements</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
        </div>
      </div>

      {/* Vue MOBILE - Cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
             Aucun véhicule ne correspond à votre recherche
          </div>
        ) : (
          filtered.map((v) => (
            <VehicleCard key={v.id} vehicle={v} status={getVehicleStatus(v.lastDeliveryAt)} />
          ))
        )}
      </div>

      {/* Vue DESKTOP - Tableau */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 text-gray-500 text-left border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Immatriculation</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Kilométrage</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Type</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Département</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Capacité</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Dernier plein</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Statut</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={8} className="px-6 py-6 h-12 bg-gray-50/20"></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-gray-400 italic">
                  Aucun véhicule dans votre flotte
                </td>
              </tr>
            ) : (
              filtered.map((v) => {
                const vs = getVehicleStatus(v.lastDeliveryAt);
                return (
                  <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#0A2463]">{v.plate}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {v.mileage ? `${v.mileage.toLocaleString()} km` : "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{v.fuelType}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{v.department || "—"}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {v.tankCapacityLiters ? `${v.tankCapacityLiters} L` : "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{formatDate(v.lastDeliveryAt)}</td>
                    <td className="px-6 py-4">
                      {vs === "ok" && <StatusBadge label="OK" color="green" />}
                      {vs === "alert" && <StatusBadge label="Alerte" color="orange" />}
                      {vs === "never" && <StatusBadge label="Jamais livré" color="gray" />}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/commandes?vehicleId=${v.id}&plate=${v.plate}`}
                        className="px-4 py-1.5 bg-[#FF6B35]/10 text-[#FF6B35] rounded-lg text-xs font-bold hover:bg-[#FF6B35] hover:text-white transition-all duration-200"
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
