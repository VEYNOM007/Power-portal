"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useCompany } from "@/lib/hooks/useCompany";
import { formatDate, daysSince } from "@/lib/utils/weekLabel";
import StatusBadge from "@/lib/components/ui/StatusBadge";
import { Vehicle, VehicleFormData, getVehicleDeliveryHistory, FleetOrderWithDriver } from "@/lib/firebase/firestore";

type VehicleStatus = "ok" | "alert" | "never";

function getVehicleStatus(lastDeliveryAt: Date | null): VehicleStatus {
  if (!lastDeliveryAt) return "never";
  const days = daysSince(lastDeliveryAt);
  if (days === null) return "never";
  return days > 5 ? "alert" : "ok";
}

const FUEL_TYPES = ["diesel", "sp95", "sp98", "e10", "e85"];

// ---- Vehicle Modal (Add / Edit) ----
function VehicleModal({
  vehicle,
  onSubmit,
  onClose,
  isSubmitting,
}: {
  vehicle?: Vehicle;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
}) {
  const [plate, setPlate] = useState(vehicle?.plate ?? "");
  const [fuelType, setFuelType] = useState(vehicle?.fuelType ?? "diesel");
  const [department, setDepartment] = useState(vehicle?.department ?? "");
  const [tankCapacity, setTankCapacity] = useState(
    vehicle?.tankCapacityLiters?.toString() ?? ""
  );
  const [error, setError] = useState("");

  const isEdit = !!vehicle;
  const title = isEdit ? "Modifier le véhicule" : "Ajouter un véhicule";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!plate.trim()) { setError("Immatriculation requise"); return; }
    if (!department.trim()) { setError("Département requis"); return; }

    await onSubmit({
      plate: plate.trim(),
      fuelType,
      department: department.trim(),
      tankCapacityLiters: tankCapacity ? Number(tankCapacity) : null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-[#0A2463] px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Plate */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Immatriculation *</label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="AA-123-AA"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type de carburant *</label>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            >
              {FUEL_TYPES.map((ft) => (
                <option key={ft} value={ft}>{ft.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Département *</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Logistique"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </div>

          {/* Tank Capacity */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Capacité (L)</label>
            <input
              type="number"
              value={tankCapacity}
              onChange={(e) => setTankCapacity(e.target.value)}
              placeholder="80"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-[#0A2463] text-white rounded-xl text-sm font-bold hover:bg-[#0A2463]/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Enregistrement..." : isEdit ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Composant interne pour l'affichage en carte sur Mobile
function VehicleCard({ vehicle, status, onEdit, onHistory, onRelease }: {
  vehicle: Vehicle,
  status: VehicleStatus,
  onEdit: () => void,
  onHistory: () => void,
  onRelease: () => void
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#0A2463] mb-0.5">{vehicle.plate}</h3>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{vehicle.fuelType}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onHistory}
            className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            title="Historique"
          >
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="Modifier"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <div className="flex flex-col items-end gap-2">
            {status === "ok" && <StatusBadge label="OK" color="green" />}
            {status === "alert" && <StatusBadge label="Alerte" color="orange" />}
            {status === "never" && <StatusBadge label="Jamais livré" color="gray" />}
          </div>
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
           <div className="flex items-center justify-between mb-0.5">
             <p className="text-[10px] text-gray-400 font-bold uppercase">Conducteur</p>
             {vehicle.assignedDriverName && (
               <button
                 onClick={onRelease}
                 className="text-[10px] text-red-500 hover:text-red-700 font-medium underline"
                 title="Libérer le véhicule"
               >
                 Libérer
               </button>
             )}
           </div>
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

// ---- Vehicle History Modal ----
function VehicleHistoryModal({
  vehicle,
  onClose,
}: {
  vehicle: Vehicle;
  onClose: () => void;
}) {
  const [orders, setOrders] = useState<FleetOrderWithDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      setError("");
      try {
        const history = await getVehicleDeliveryHistory(vehicle.plate);
        setOrders(history);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [vehicle.plate]);

  const formatDateTime = (date: Date | null) => {
    if (!date) return "\u2014";
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#0A2463] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{"\uD83D\uDCCB"}</span>
            <div>
              <h2 className="text-white font-bold text-lg">Historique des livraisons</h2>
              <p className="text-white/70 text-sm">{vehicle.plate}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">&times;</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[#0A2463]/20 border-t-[#0A2463] rounded-full"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">Erreur: {error}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-4">{"\uD83D\uDE9A"}</p>
              <p>Aucune livraison enregistr{"\u00E9"}e pour ce v{"\u00E9"}hicule</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-3 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Date/Heure</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Driver Power</th>
                    <th className="text-right py-3 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Litres</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-400 text-xs uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-medium text-gray-700">{formatDateTime(order.deliveredAt)}</td>
                      <td className="py-3 px-4 text-gray-600">{order.powerDriverName || "\u2014"}</td>
                      <td className="py-3 px-4 text-right font-bold text-[#0A2463]">{order.litersDelivered || 0} L</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold">
                          {"\u2705"} Livr{"\u00E9"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FlottePage() {
  const { vehicles, loading, addVehicle, updateVehicle, resetAllVehicles } = useCompany();
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyVehicle, setHistoryVehicle] = useState<Vehicle | undefined>(undefined);

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

  async function handleSubmit(data: VehicleFormData) {
    setIsSubmitting(true);
    try {
      if (editVehicle) {
        await updateVehicle(editVehicle.id, data);
      } else {
        await addVehicle(data);
      }
      setShowModal(false);
      setEditVehicle(undefined);
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function openAdd() {
    setEditVehicle(undefined);
    setShowModal(true);
  }

  function openEdit(v: Vehicle) {
    setEditVehicle(v);
    setShowModal(true);
  }

  function openHistory(v: Vehicle) {
    setHistoryVehicle(v);
  }

  async function openRelease(v: Vehicle) {
    if (!v.assignedDriverName) return;
    if (!confirm(`Libérer le véhicule ${v.plate} de ${v.assignedDriverName} ?\n\nLe conducteur sera dissocié et le véhicule redeviendra disponible.`)) return;

    try {
      await updateVehicle(v.id, { assignedDriverName: null });
    } catch (err: any) {
      alert("Erreur: " + err.message);
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2463]">Flotte</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos véhicules et suivez leur consommation.</p>
        </div>
        <div className="flex items-center gap-2">
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
            <button
              onClick={openAdd}
              className="px-4 py-2.5 bg-[#0A2463] text-white rounded-xl text-sm font-bold hover:bg-[#0A2463]/90 transition-colors flex items-center gap-2"
            >
              <span className="text-lg leading-none">+</span>
              <span className="hidden sm:inline">Ajouter un véhicule</span>
            </button>
            <button
              onClick={async () => {
                if (!confirm("⚠️ Réinitialiser tous les véhicules ?\n\nCette action va retirer tous les conducteurs assignés aux véhicules. Les véhicules redeviendront tous disponibles.\n\nCette action est irréversible !")) return;
                try {
                  await resetAllVehicles();
                  alert("✅ Tous les véhicules ont été réinitialisés avec succès !");
                } catch (err: any) {
                  alert("Erreur: " + err.message);
                }
              }}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
              title="Réinitialiser tous les véhicules (retirer tous les conducteurs)"
            >
              <span className="text-lg leading-none">🔄</span>
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>
        </div>
      </div>

      {/* Barre de recherche + filtre - Premium Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        <div className="md:col-span-8 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Rechercher par immatriculation ou conducteur..."
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
            <VehicleCard key={v.id} vehicle={v} status={getVehicleStatus(v.lastDeliveryAt)} onEdit={() => openEdit(v)} onHistory={() => openHistory(v)} onRelease={() => openRelease(v)} />
          ))
        )}
      </div>

      {/* Vue DESKTOP - Tableau */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 text-gray-500 text-left border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Immatriculation</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Type</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Département</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Capacité</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Conducteur</th>
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
                    <td className="px-6 py-4 text-gray-500 font-medium">{v.fuelType}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{v.department || "—"}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {v.tankCapacityLiters ? `${v.tankCapacityLiters} L` : "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      <div className="flex items-center gap-2">
                        <span>{v.assignedDriverName || "—"}</span>
                        {v.assignedDriverName && (
                          <button
                            onClick={() => openRelease(v)}
                            className="text-[10px] text-red-500 hover:text-red-700 font-medium underline"
                            title="Libérer le véhicule"
                          >
                            Libérer
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{formatDate(v.lastDeliveryAt)}</td>
                    <td className="px-6 py-4">
                      {vs === "ok" && <StatusBadge label="OK" color="green" />}
                      {vs === "alert" && <StatusBadge label="Alerte" color="orange" />}
                      {vs === "never" && <StatusBadge label="Jamais livré" color="gray" />}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openHistory(v)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                          title="Historique"
                        >
                          Historique
                        </button>
                        <button
                          onClick={() => openEdit(v)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                          title="Modifier"
                        >
                          Modifier
                        </button>
                        <Link
                          href={`/commandes?vehicleId=${v.id}&plate=${v.plate}`}
                          className="px-4 py-1.5 bg-[#FF6B35]/10 text-[#FF6B35] rounded-lg text-xs font-bold hover:bg-[#FF6B35] hover:text-white transition-all duration-200"
                        >
                          Commander
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <VehicleModal
          vehicle={editVehicle}
          onSubmit={handleSubmit}
          onClose={() => { setShowModal(false); setEditVehicle(undefined); }}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Modal Historique */}
      {historyVehicle && (
        <VehicleHistoryModal
          vehicle={historyVehicle}
          onClose={() => setHistoryVehicle(undefined)}
        />
      )}
    </div>
  );
}
