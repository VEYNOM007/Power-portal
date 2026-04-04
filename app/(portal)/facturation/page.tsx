"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { onWeeklyInvoicesSnapshot, WeeklyInvoice } from "@/lib/firebase/firestore";
import { formatDate } from "@/lib/utils/weekLabel";
import StatusBadge from "@/lib/components/ui/StatusBadge";
import KpiCard from "@/lib/components/ui/KpiCard";
import SkeletonRow from "@/lib/components/ui/SkeletonRow";

const invoiceStatusMap: Record<
  string,
  { label: string; color: "green" | "orange" | "blue" | "red" | "gray" }
> = {
  draft: { label: "Brouillon", color: "gray" },
  sent: { label: "Envoyé", color: "blue" },
  paid: { label: "Payé", color: "green" },
};

export default function FacturationPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<WeeklyInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.companyId) return;
    const unsub = onWeeklyInvoicesSnapshot(user.companyId, (inv) => {
      setInvoices(inv);
      setLoading(false);
    });
    return unsub;
  }, [user?.companyId]);

  const yearTotalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.totalAmountHT, 0);

  const yearTotalPending = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + i.totalAmountHT, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A2463] mb-6">Facturation</h1>

      {/* KPI annuels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <KpiCard
          label="Total payé cette année"
          value={`${yearTotalPaid.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € HT`}
          accent
        />
        <KpiCard
          label="Total en attente"
          value={`${yearTotalPending.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € HT`}
          warning={yearTotalPending > 0}
        />
      </div>

      {/* Tableau factures */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#0A2463]">Pro formas hebdomadaires</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-6 py-3 font-medium">Semaine</th>
                <th className="px-6 py-3 font-medium">Litres</th>
                <th className="px-6 py-3 font-medium">Montant HT</th>
                <th className="px-6 py-3 font-medium">Statut</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Aucune facture disponible — les pro formas sont générés chaque lundi pour la
                    semaine précédente.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const badge = invoiceStatusMap[inv.status] ?? {
                    label: inv.status,
                    color: "gray" as const,
                  };
                  const isExpanded = expandedId === inv.id;
                  return (
                    <React.Fragment key={inv.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium">{inv.weekLabel}</td>
                        <td className="px-6 py-3 text-gray-600">
                          {inv.totalLiters.toLocaleString("fr-FR")} L
                        </td>
                        <td className="px-6 py-3 text-gray-600">
                          {inv.totalAmountHT.toLocaleString("fr-FR", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          €
                        </td>
                        <td className="px-6 py-3">
                          <StatusBadge label={badge.label} color={badge.color} />
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex gap-3">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                              className="text-sm font-medium text-[#0A2463] hover:underline cursor-pointer"
                            >
                              {isExpanded ? "Masquer" : "Détail"}
                            </button>
                            <button
                              onClick={() => inv.pdfUrl && window.open(inv.pdfUrl, "_blank")}
                              disabled={!inv.pdfUrl}
                              className="text-sm font-medium text-[#FF6B35] hover:underline disabled:text-gray-300 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                            >
                              PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-gray-50">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-gray-500">
                                  <th className="text-left py-1 font-medium">Date</th>
                                  <th className="text-left py-1 font-medium">Véhicule</th>
                                  <th className="text-left py-1 font-medium">Litres</th>
                                  <th className="text-left py-1 font-medium">Prix/L</th>
                                  <th className="text-left py-1 font-medium">Montant</th>
                                </tr>
                              </thead>
                              <tbody>
                                {inv.lineItems.map((item, idx) => (
                                  <tr key={idx} className="border-t border-gray-200">
                                    <td className="py-2 text-gray-600">
                                      {formatDate(item.deliveredAt)}
                                    </td>
                                    <td className="py-2">{item.vehiclePlate}</td>
                                    <td className="py-2 text-gray-600">
                                      {item.litersDelivered} L
                                    </td>
                                    <td className="py-2 text-gray-600">
                                      {item.pricePerLiter.toFixed(2)} €
                                    </td>
                                    <td className="py-2 text-gray-600">
                                      {item.amountHT.toFixed(2)} €
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
