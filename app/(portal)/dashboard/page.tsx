"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCompany } from "@/lib/hooks/useCompany";
import { onFleetOrdersSnapshot, FleetOrder } from "@/lib/firebase/firestore";
import { getISOWeekLabel, getCurrentWeekLabel, formatDate, daysSince } from "@/lib/utils/weekLabel";
import KpiCard from "@/lib/components/ui/KpiCard";
import StatusBadge from "@/lib/components/ui/StatusBadge";

type VehicleAlert = "ok" | "alert" | "never";

function getVehicleStatus(lastDeliveryAt: Date | null): VehicleAlert {
  if (!lastDeliveryAt) return "never";
  const days = daysSince(lastDeliveryAt);
  if (days === null) return "never";
  return days > 5 ? "alert" : "ok";
}

export default function DashboardPage() {
  const { company, vehicles, loading } = useCompany();
  const { user } = useAuth();
  const [orders, setOrders] = useState<FleetOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user?.companyId) return;
    const unsub = onFleetOrdersSnapshot(user.companyId, (o) => {
      setOrders(o);
      setOrdersLoading(false);
    });
    return unsub;
  }, [user?.companyId]);

  const weekLabel = getISOWeekLabel();
  const weekOrders = orders.filter((o) => o.weekLabel === weekLabel);
  const deliveredOrders = weekOrders.filter((o) => o.status === "delivered");
  const totalLiters = deliveredOrders.reduce((sum, o) => sum + (o.litersDelivered ?? 0), 0);
  const pricePerLiter = company?.pricePerLiter;
  const estimatedAmount = pricePerLiter != null ? totalLiters * pricePerLiter : null;
  const activeOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "assigned" || o.status === "in_progress"
  ).length;

  const alertVehicles = vehicles.filter((v) => {
    const s = getVehicleStatus(v.lastDeliveryAt);
    return s === "alert" || s === "never";
  });
  const showAlert = alertVehicles.length > 0;

  const sortedVehicles = [...vehicles].sort((a, b) => {
    const aTime = a.lastDeliveryAt?.getTime() ?? 0;
    const bTime = b.lastDeliveryAt?.getTime() ?? 0;
    return aTime - bTime;
  });
  const recentVehicles = sortedVehicles.slice(0, 5);

  const isLoading = loading || ordersLoading;

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#0A2463] mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Alerte flotte */}
      {showAlert && (
        <div className="mb-6 bg-[#FEF3C7] border border-[#F59E0B] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <p className="text-sm text-[#92400E] font-medium">
              {alertVehicles.length} véhicule{alertVehicles.length > 1 ? "s" : ""} sans livraison depuis 5+ jours
            </p>
          </div>
          <Link href="/flotte" className="text-sm font-semibold text-[#92400E] hover:underline">
            Voir la flotte →
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">{getCurrentWeekLabel()}</p>
        </div>
        <Link
          href="/commandes"
          className="bg-[#FF6B35] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#e55e2e] transition-colors text-sm"
        >
          + Nouvelle commande
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KpiCard
          label="Litres livrés"
          value={totalLiters > 0 ? `${totalLiters.toLocaleString("fr-FR")} L` : "— L"}
          sub="Cette semaine"
        />
        <KpiCard
          label="Montant estimé"
          value={
            estimatedAmount != null
              ? `${estimatedAmount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`
              : "— €"
          }
          sub={pricePerLiter != null ? `${pricePerLiter.toFixed(2)} €/L` : undefined}
        />
        <KpiCard label="En livraison" value={String(activeOrders)} accent />
        <KpiCard
          label="Alertes flotte"
          value={String(alertVehicles.length)}
          warning={alertVehicles.length > 0}
        />
      </div>

      {/* Tableau flotte résumé */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#0A2463]">Flotte — Véhicules récents</h2>
          <Link href="/flotte" className="text-sm text-[#0A2463] font-medium hover:underline">
            Voir tout →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-6 py-3 font-medium">Véhicule</th>
                <th className="px-6 py-3 font-medium">Conducteur</th>
                <th className="px-6 py-3 font-medium">Département</th>
                <th className="px-6 py-3 font-medium">Carburant</th>
                <th className="px-6 py-3 font-medium">Dernier plein</th>
                <th className="px-6 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentVehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Aucun véhicule dans votre flotte
                  </td>
                </tr>
              ) : (
                recentVehicles.map((v) => {
                  const vs = getVehicleStatus(v.lastDeliveryAt);
                  return (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium">{v.plate}</td>
                      <td className="px-6 py-3 text-gray-600">{v.assignedDriverName || "—"}</td>
                      <td className="px-6 py-3 text-gray-600">{v.department || "—"}</td>
                      <td className="px-6 py-3 text-gray-600">{v.fuelType}</td>
                      <td className="px-6 py-3 text-gray-600">{formatDate(v.lastDeliveryAt)}</td>
                      <td className="px-6 py-3">
                        {vs === "ok" && <StatusBadge label="OK" color="green" />}
                        {vs === "alert" && <StatusBadge label="Alerte" color="orange" />}
                        {vs === "never" && <StatusBadge label="Jamais livré" color="gray" />}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
