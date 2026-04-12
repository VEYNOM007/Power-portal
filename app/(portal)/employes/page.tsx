"use client";

import { useState, useEffect } from "react";
import { useCompany } from "@/lib/hooks/useCompany";
import { useAppConfig } from "@/lib/hooks/useAppConfig";
import StatusBadge from "@/lib/components/ui/StatusBadge";
import { Employee } from "@/lib/firebase/firestore";

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
  const { availableFuelTypes, loading: configLoading } = useAppConfig();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  // Vehicle state
  const [vehicleOption, setVehicleOption] = useState<VehicleOption>("none");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [newPlate, setNewPlate] = useState("");
  const [newFuelType, setNewFuelType] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newTankCapacity, setNewTankCapacity] = useState("");

  const availableVehicles = vehicles.filter(v => !v.assignedDriverName || v.assignedDriverName?.trim() === "");

  // Set default fuel type when config loads
  useEffect(() => {
    if (!configLoading && availableFuelTypes.length > 0 && !newFuelType) {
      setNewFuelType(availableFuelTypes[0].id);
    }
  }, [configLoading, availableFuelTypes, newFuelType]);

  // Formatage du téléphone
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(?=\d)/g, '$1 ');
    }
    return numbers.substring(0, 13).replace(/(\d{2})(?=\d)/g, '$1 ');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validation employé - lettres seulement pour nom/prénom
    if (!firstName.trim() || !lastName.trim()) {
      setError("Prénom et nom requis");
      return;
    }
    if (!/^[a-zA-ZÀ-ÿ\s\-]+$/.test(firstName.trim()) || !/^[a-zA-ZÀ-ÿ\s\-]+$/.test(lastName.trim())) {
      setError("Le prénom et nom ne doivent contenir que des lettres");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email invalide");
      return;
    }
    if (phone.trim() && phone.replace(/\s/g, '').length !== 10) {
      setError("Le téléphone doit contenir 10 chiffres");
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
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s\-]/g, '');
                      setFirstName(value);
                    }}
                    placeholder="Jean"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nom *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s\-]/g, '');
                      setLastName(value);
                    }}
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
                  onChange={handlePhoneChange}
                  placeholder="06 12 34 56 78"
                  maxLength={14}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </div>
            </div>

            {/* Section 2: Véhicule */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs">2</span>
                Véhicule (Optionnel)
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
                        {configLoading ? (
                          <div className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500">
                            Chargement...
                          </div>
                        ) : availableFuelTypes.length === 0 ? (
                          <div className="w-full border border-red-200 rounded-xl px-4 py-3 text-sm text-red-500 bg-red-50">
                            ⚠️ Aucun carburant disponible
                          </div>
                        ) : (
                          <select
                            value={newFuelType}
                            onChange={(e) => setNewFuelType(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                            disabled={!newFuelType}
                          >
                            <option value="">Sélectionner...</option>
                            {availableFuelTypes.map((fuel) => (
                              <option key={fuel.id} value={fuel.id}>
                                {fuel.label} ({fuel.price.toFixed(2)} €/L)
                              </option>
                            ))}
                          </select>
                        )}
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
  const { employees, vehicles, loading, createEmployee, addVehicle, updateVehicle, deleteEmployee, suspendEmployee, unsuspendEmployee, assignVehicleToEmployee, unassignVehicle } = useCompany();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignVehicleModal, setAssignVehicleModal] = useState<{ employee: Employee; isOpen: boolean }>({ employee: null as any, isOpen: false });
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

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

  async function handleDeleteEmployee(employeeUid: string, employeeName: string) {
    if (!confirm(`Supprimer l'employé ${employeeName} ?\n\nCette action irréversible supprimera son compte et libérera son véhicule assigné.`)) return;

    try {
      await deleteEmployee(employeeUid);
    } catch (err: any) {
      alert("Erreur: " + (err.message || "Impossible de supprimer l'employé"));
    }
  }

  async function handleSuspendEmployee(employeeUid: string, employeeName: string) {
    if (!confirm(`Suspendre l'employé ${employeeName} ?\n\nIl ne pourra plus se connecter mais son compte sera conservé.`)) return;

    try {
      await suspendEmployee(employeeUid);
    } catch (err: any) {
      alert("Erreur: " + (err.message || "Impossible de suspendre l'employé"));
    }
  }

  function openAssignVehicleModal(employee: Employee) {
    setAssignVehicleModal({ employee, isOpen: true });
    setSelectedVehicleId("");
  }

  async function handleAssignVehicle() {
    if (!assignVehicleModal.employee) return;
    if (!selectedVehicleId) {
      alert("Veuillez sélectionner un véhicule");
      return;
    }

    try {
      await assignVehicleToEmployee(selectedVehicleId, assignVehicleModal.employee.displayName);
      setAssignVehicleModal({ employee: null as any, isOpen: false });
      setSelectedVehicleId("");
    } catch (err: any) {
      alert("Erreur: " + (err.message || "Impossible d'assigner le véhicule"));
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
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A2463]/10 flex items-center justify-center text-[#0A2463] font-bold text-sm">
                    {emp.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-[#0A2463]">{emp.displayName}</p>
                    <p className="text-xs text-gray-400">{emp.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <span>{emp.phone || "Pas de tél."}</span>
                <span>{formatDate(emp.createdAt)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openAssignVehicleModal(emp)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  Assigner véhicule
                </button>
                <button
                  onClick={() => handleSuspendEmployee(emp.uid, emp.displayName)}
                  className="flex-1 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors"
                >
                  Suspendre
                </button>
                <button
                  onClick={() => handleDeleteEmployee(emp.uid, emp.displayName)}
                  className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                >
                  Supprimer
                </button>
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
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Actions</th>
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
                <td colSpan={6} className="px-6 py-16 text-center text-gray-400 italic">
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openAssignVehicleModal(emp)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        Assigner véhicule
                      </button>
                      <button
                        onClick={() => handleSuspendEmployee(emp.uid, emp.displayName)}
                        className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors"
                      >
                        Suspendre
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.uid, emp.displayName)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
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

      {/* Modal d'assignation de véhicule */}
      {assignVehicleModal.isOpen && assignVehicleModal.employee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="bg-[#0A2463] px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Assigner un véhicule</h2>
              <button onClick={() => setAssignVehicleModal({ employee: null as any, isOpen: false })} className="text-white/70 hover:text-white text-xl leading-none">&times;</button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Assigner un véhicule à <strong>{assignVehicleModal.employee.displayName}</strong>
              </p>

              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Véhicules disponibles</label>
                {vehicles.filter(v => !v.assignedDriverName || v.assignedDriverName?.trim() === "").length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Aucun véhicule disponible</p>
                ) : (
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  >
                    <option value="">Sélectionner un véhicule...</option>
                    {vehicles
                      .filter(v => !v.assignedDriverName || v.assignedDriverName?.trim() === "")
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.plate} - {v.department || "Sans département"} ({v.fuelType.toUpperCase()})
                        </option>
                      ))}
                  </select>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setAssignVehicleModal({ employee: null as any, isOpen: false })}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAssignVehicle}
                  disabled={!selectedVehicleId}
                  className="flex-1 px-4 py-3 bg-[#0A2463] text-white rounded-xl text-sm font-bold hover:bg-[#0A2463]/90 transition-colors disabled:opacity-50"
                >
                  Assigner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
