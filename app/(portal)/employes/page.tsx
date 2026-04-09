"use client";

import { useState } from "react";
import { useCompany } from "@/lib/hooks/useCompany";
import StatusBadge from "@/lib/components/ui/StatusBadge";

// ---- Add Employee Modal ----
function AddEmployeeModal({
  onSubmit,
  onClose,
  isSubmitting,
}: {
  onSubmit: (data: { firstName: string; lastName: string; email: string; phone: string }) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Prénom et nom requis");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email invalide");
      return;
    }

    await onSubmit({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone: phone.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-[#0A2463] px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Ajouter un employé</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jean.dupont@entreprise.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Téléphone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 12 34 56 78"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

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
              {isSubmitting ? "Création..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function EmployesPage() {
  const { employees, loading, createEmployee } = useCompany();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: { firstName: string; lastName: string; email: string; phone: string }) {
    setIsSubmitting(true);
    try {
      await createEmployee(data);
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
          <p className="text-sm text-gray-500 mt-1">Gérez les comptes employés pour la commande de carburant.</p>
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
            <p className="text-sm font-medium text-blue-800">Comment ça marche ?</p>
            <p className="text-xs text-blue-600 mt-1">
              Les employés reçoivent un email d&apos;activation. Ils peuvent ensuite se connecter via l&apos;app mobile Power
              (section &quot;Connexion Flotte&quot;) et commander du carburant pour les véhicules de l&apos;entreprise.
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
                  Aucun employé ajouté. Cliquez sur &quot;Ajouter un employé&quot; pour commencer.
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
        />
      )}
    </div>
  );
}
