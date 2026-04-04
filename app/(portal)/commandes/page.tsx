"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCompany } from "@/lib/hooks/useCompany";
import { onFleetOrdersSnapshot, FleetOrder, fleetOrdersRef } from "@/lib/firebase/firestore";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { getISOWeekLabel, formatDate } from "@/lib/utils/weekLabel";
import StatusBadge from "@/lib/components/ui/StatusBadge";
import SkeletonRow from "@/lib/components/ui/SkeletonRow";

const statusBadgeMap: Record<
  string,
  { label: string; color: "green" | "orange" | "blue" | "red" | "gray" }
> = {
  pending: { label: "En attente", color: "gray" },
  assigned: { label: "Assignée", color: "blue" },
  in_progress: { label: "En cours", color: "orange" },
  delivered: { label: "Livrée", color: "green" },
  cancelled: { label: "Annulée", color: "red" },
};

export default function CommandesPage() {
  const searchParams = useSearchParams();
  const preselectedVehicleId = searchParams.get("vehicleId");

  const { user } = useAuth();
  const { company, fleetId, vehicles, loading: companyLoading } = useCompany();
  const [orders, setOrders] = useState<FleetOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [success, setSuccess] = useState("");

  // Formulaire
  const [selectedVehicleId, setSelectedVehicleId] = useState(preselectedVehicleId ?? "");
  const [liters, setLiters] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Pré-remplir adresse depuis company
  useEffect(() => {
    if (company?.billingAddress) {
      setStreet(company.billingAddress.street);
      setCity(company.billingAddress.city);
      setPostalCode(company.billingAddress.postalCode);
      setCountry(company.billingAddress.country);
    }
  }, [company]);

  // Real-time orders
  useEffect(() => {
    if (!user?.companyId) return;
    const unsub = onFleetOrdersSnapshot(user.companyId, (o) => {
      setOrders(o);
      setOrdersLoading(false);
    });
    return unsub;
  }, [user?.companyId]);

  const filteredOrders =
    statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!selectedVehicleId || !fleetId || !user?.companyId) {
      setFormError("Veuillez sélectionner un véhicule.");
      return;
    }

    const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    if (!selectedVehicle) return;

    setSubmitting(true);
    try {
      await addDoc(fleetOrdersRef, {
        companyId: user.companyId,
        fleetId,
        vehicleId: selectedVehicle.id,
        vehiclePlate: selectedVehicle.plate,
        requestedBy: user.uid,
        requestedByRole: "FLEET_MANAGER",
        litersRequested: liters ? Number(liters) : null,
        litersDelivered: null,
        deliveryAddress: { street, city, postalCode, country },
        status: "pending",
        weekLabel: getISOWeekLabel(),
        powerDriverUid: null,
        createdAt: serverTimestamp(),
        assignedAt: null,
        deliveredAt: null,
        cancelledAt: null,
      });

      setSuccess(`Commande pour ${selectedVehicle.plate} créée avec succès.`);
      setLiters("");
      setSelectedVehicleId("");
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setFormError("Erreur lors de la création de la commande.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A2463] mb-6">Commandes</h1>

      {/* Section A — Formulaire */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-[#0A2463] mb-4">Nouvelle commande</h2>

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
            ✅ {success}
          </div>
        )}
        {formError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
              >
                <option value="">Sélectionner un véhicule</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate} — {v.department || "Sans dept."}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité (L){" "}
                <span className="text-gray-400 font-normal">— vide = plein complet</span>
              </label>
              <input
                type="number"
                value={liters}
                onChange={(e) => setLiters(e.target.value)}
                placeholder="Ex: 50"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rue</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || companyLoading}
            className="bg-[#FF6B35] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#e55e2e] transition-colors disabled:opacity-50 text-sm cursor-pointer"
          >
            {submitting ? "Envoi..." : "Commander"}
          </button>
        </form>
      </div>

      {/* Section B — Liste commandes */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#0A2463]">Historique</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
          >
            <option value="all">Toutes</option>
            <option value="pending">En attente</option>
            <option value="assigned">Assignée</option>
            <option value="in_progress">En cours</option>
            <option value="delivered">Livrées</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-6 py-3 font-medium">Véhicule</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">L demandés</th>
                <th className="px-6 py-3 font-medium">L livrés</th>
                <th className="px-6 py-3 font-medium">Statut</th>
                <th className="px-6 py-3 font-medium">Semaine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ordersLoading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const badge = statusBadgeMap[o.status] ?? {
                    label: o.status,
                    color: "gray" as const,
                  };
                  return (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium">{o.vehiclePlate}</td>
                      <td className="px-6 py-3 text-gray-600">{formatDate(o.createdAt)}</td>
                      <td className="px-6 py-3 text-gray-600">
                        {o.litersRequested ?? "Plein"}
                      </td>
                      <td className="px-6 py-3 text-gray-600">{o.litersDelivered ?? "—"}</td>
                      <td className="px-6 py-3">
                        <StatusBadge label={badge.label} color={badge.color} />
                      </td>
                      <td className="px-6 py-3 text-gray-600">{o.weekLabel}</td>
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
