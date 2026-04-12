"use client";

import { useState } from "react";
import { useCompany } from "@/lib/hooks/useCompany";
import StatusBadge from "@/lib/components/ui/StatusBadge";

type VehicleOption = "existing" | "new" | "none";

// ---- Add Employee Modal with Vehicle Assignment ----
function AddEmployeeModal({
  onSubmit,
  onClose,
  isSubmitting,
  vehicles,
}: {
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    vehicleOption: VehicleOption;
    existingVehicleId?: string;
    newVehicle?: {
      plate: string;
      fuelType: string;
      department: string;
      tankCapacityLiters: number | null;
    };
  }) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
  vehicles: any[];
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  // Vehicle state
  const [vehicleOption, setVehicleOption] = useState<VehicleOption>("none");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [newPlate, setNewPlate] = useState("");
  const [newFuelType, setNewFuelType] = useState("diesel");
  const [newDepartment, setNewDepartment] = useState("");
  const [newTankCapacity, setNewTankCapacity] = useState("");

  const availableVehicles = vehicles.filter(v => !v.assignedDriverName);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validation employé
    if (!firstName.trim() || !lastName.trim()) {
      setError("Prénom et nom requis");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email invalide");
      return;
    }

    // Validation véhicule
    if (vehicleOption === "existing" && !selectedVehicleId) {
      setError("Veuillez sélectionner un véhicule");
      return;
    }

    if (vehicleOption === "new") {
      if (!newPlate.trim()) {
        setError("Immatriculation du véhicule requise");
        return;
      }
      if (!newDepartment.trim()) {
        setError("Département du véhicule requis");
        return;
      }
    }

    await onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      vehicleOption,
      existingVehicleId: selectedVehicleId,
      newVehicle: vehicleOption === "new" ? {
        plate: newPlate.trim(),
        fuelType: newFuelType,
        department: newDepartment.trim(),
        tankCapacityLiters: newTankCapacity ? Number(newTankCapacity) : null,
      } : undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-[#0A2463] px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-white font-bold text-lg">Ajouter un employé</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">&times;</button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Section 1: Informations Employé */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">1</span>
                Informations Employé
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nom *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean.dupont@entreprise.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </div>

              <div className="mt-3">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </div>
            </div>

            {/* Section 2: Véhicule */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs">2</span>
                Véhicule Assigné
              </h3>

              <div className="space-y-3">
                {/* Option: Pas de véhicule */}
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${vehicleOption === "none" ? "border-[#0A2463] bg-[#0A2463]/5" : "border-gray-200 hover:border-gray-300"}`}>
                  <input
                    type="radio"
                    name="vehicleOption"
                    checked={vehicleOption === "none"}
                    onChange={() => setVehicleOption("none")}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Aucun véhicule</p>
                    <p className="text-xs text-gray-500">L'employé sera créé sans véhicule assigné</p>
                  </div>
                </label>

                {/* Option: Véhicule existant */}
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${vehicleOption === "existing" ? "border-[#0A2463] bg-[#0A2463]/5" : "border-gray-200 hover:border-gray-300"}`}>
                  <input
                    type="radio"
                    name="vehicleOption"
                    checked={vehicleOption === "existing"}
                    onChange={() => setVehicleOption("existing")}
                    className="w-4 h-4"
                    disabled={availableVehicles.length === 0}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Véhicule existant</p>
                    <p className="text-xs text-gray-500">
                      {availableVehicles.length > 0
                        ? `${availableVehicles.length} véhicule(s) disponible(s)`
                        : "Aucun véhicule disponible"}
                    </p>
                  </div>
                </label>

                {vehicleOption === "existing" && availableVehicles.length > 0 && (
                  <div className="ml-7 mt-3">
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    >
                      <option value="">Sélectionner un véhicule...</option>
                      {availableVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.plate} - {v.department || "Sans département"} ({v.fuelType.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Option: Nouveau véhicule */}
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${vehicleOption === "new" ? "border-[#0A2463] bg-[#0A2463]/5" : "border-gray-200 hover:border-gray-300"}`}>
                  <input
                    type="radio"
                    name="vehicleOption"
                    checked={vehicleOption === "new"}
                    onChange={() => setVehicleOption("new")}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Créer un nouveau véhicule</p>
                    <p className="text-xs text-gray-500">Ajouter un véhicule à la flotte et l'assigner</p>
                  </div>
                </label>

                {vehicleOption === "new" && (
                  <div className="ml-7 mt-3 p-4 bg-gray-50 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Immatriculation *</label>
                        <input
                          type="text"
                          value={newPlate}
                          onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                          placeholder="AA-123-AA"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Carburant *</label>
                        <select
                          value={newFuelType}
                          onChange={(e) => setNewFuelType(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                        >
                          <option value="diesel">DIESEL</option>
                          <option value="sp95">SP95</option>
                          <option value="sp98">SP98</option>
                          <option value="e10">E10</option>
                          <option value="e85">E85</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Département *</label>
                        <input
                          type="text"
                          value={newDepartment}
                          onChange={(e) => setNewDepartment(e.target.value)}
                          placeholder="Logistique"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Capacité (L)</label>
                        <input
                          type="number"
                          value={newTankCapacity}
                          onChange={(e) => setNewTankCapacity(e.target.value)}
                          placeholder="80"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="text-sm text-red-500 font-medium">⚠️ {error}</p>}

            {/* Buttons */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
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
                {isSubmitting ? "Création..." : "Créer l'employé"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function EmployesPage() {
  const { employees, vehicles, loading, createEmployee, addVehicle, updateVehicle } = useCompany();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    vehicleOption: "existing" | "new" | "none";
    existingVehicleId?: string;
    newVehicle?: {
      plate: string;
      fuelType: string;
      department: string;
      tankCapacityLiters: number | null;
    };
  }) {
    setIsSubmitting(true);
    try {
      const fullName = `${data.firstName} ${data.lastName}`;

      // Étape 1: Créer le véhicule si nécessaire
      if (data.vehicleOption === "new" && data.newVehicle) {
        await addVehicle({
          plate: data.newVehicle.plate,
          fuelType: data.newVehicle.fuelType,
          department: data.newVehicle.department,
          tankCapacityLiters: data.newVehicle.tankCapacityLiters,
          assignedDriverName: fullName,
        });
      }

      // Étape 2: Créer l'employé
      await createEmployee({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      });

      // Étape 3: Si véhicule existant sélectionné, le mettre à jour
      if (data.vehicleOption === "existing" && data.existingVehicleId) {
        await updateVehicle(data.existingVehicleId, {
          assignedDriverName: fullName,
        });
      }

      setShowModal(false);
    } catch (err: any) {
      alert("Erreur: " + (err.message || "Impossible de créer l'employé"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2463]">Employés</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez les comptes employés et leurs véhicules assignés.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
            <p className="text-[10px] text-blue-400 font-bold uppercase mb-0.5">Employés</p>
            <p className="text-lg font-bold text-blue-700 leading-none">{employees.length}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-[#0A2463] text-white rounded-xl text-sm font-bold hover:bg-[#0A2463]/90 transition-colors flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            <span className="hidden sm:inline">Ajouter un employé</span>
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-lg">ℹ️</span>
          <div>
            <p className="text-sm font-medium text-blue-800">Nouveau : Création simplifiée !</p>
            <p className="text-xs text-blue-600 mt-1">
              Vous pouvez maintenant créer un employé ET lui assigner un véhicule en une seule opération.
              Sélectionnez un véhicule existant ou créez-en un nouveau directement dans le formulaire.
            </p>
          </div>
        </div>
      </div>

      {/* Vue MOBILE - Cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))
        ) : employees.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
            Aucun employé ajouté
          </div>
        ) : (
          employees.map((emp) => (
            <div key={emp.uid} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#0A2463]/10 flex items-center justify-center text-[#0A2463] font-bold text-sm">
                  {emp.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-[#0A2463]">{emp.displayName}</p>
                  <p className="text-xs text-gray-400">{emp.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{emp.phone || "Pas de tél."}</span>
                <span>{formatDate(emp.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vue DESKTOP - Tableau */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 text-gray-500 text-left border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Employé</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Email</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Téléphone</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Ajouté le</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-6 h-12 bg-gray-50/20"></td>
                </tr>
              ))
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-gray-400 italic">
                  Aucun employé ajouté. Cliquez sur "Ajouter un employé" pour commencer.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.uid} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0A2463]/10 flex items-center justify-center text-[#0A2463] font-bold text-xs">
                        {emp.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-[#0A2463]">{emp.displayName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{emp.email}</td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{emp.phone || "—"}</td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{formatDate(emp.createdAt)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge label="Actif" color="green" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <AddEmployeeModal
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          isSubmitting={isSubmitting}
          vehicles={vehicles}
        />
      )}
    </div>
  );
}
