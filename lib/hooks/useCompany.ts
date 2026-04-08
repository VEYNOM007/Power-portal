"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getCompany, getFleetByCompany, getVehicles, addVehicle, updateVehicle, Company, Vehicle, VehicleFormData } from "../firebase/firestore";

export function useCompany() {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [fleetId, setFleetId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🚀 VERSION DETECTEE: v1.0.4 - SI VOUS VOYEZ CE MESSAGE, LE CODE EST A JOUR");
    // Si pas de companyId, on reset tout
    if (!user?.companyId) {
      if (!user) setLoading(true); // En attente de l'auth
      else {
        setCompany(null);
        setFleetId(null);
        setVehicles([]);
        setLoading(false);
      }
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      console.log("🛠️ Hook useCompany: Début chargement pour", user.companyId);

      try {
        // Tâche 1: Charger les infos d'entreprise (optionnel pour ne pas bloquer)
        getCompany(user.companyId!).then(comp => {
          if (!cancelled && comp) {
            setCompany(comp);
            console.log("✅ Infos Entreprise chargées");
          }
        }).catch(err => {
          console.warn("⚠️ getCompany bloqué (Règles ?):", err.message);
        });

        // Tâche 2: Charger la flotte et les véhicules
        const fleet = await getFleetByCompany(user.companyId!).catch(err => {
          console.error("❌ getFleetByCompany échec (Check rules):", err.message);
          return null;
        });

        if (!cancelled && fleet) {
          setFleetId(fleet.id);
          console.log("📍 Flotte identifiée:", fleet.id);

          const vehs = await getVehicles(fleet.id).catch(err => {
            console.error("❌ getVehicles échec (Check rules):", err.message);
            return [];
          });

          if (!cancelled) {
            setVehicles(vehs);
            console.log("✅ Véhicules chargés:", vehs.length);
          }
        } else if (!cancelled) {
          console.warn("⚠️ Aucune flotte trouvée pour cette entreprise.");
          setVehicles([]);
        }
      } catch (err: any) {
        console.error("💥 useCompany fatal error:", err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.companyId, user?.uid]);

  const refreshVehicles = useCallback(async () => {
    if (!fleetId) return;
    const vehs = await getVehicles(fleetId).catch(() => []);
    setVehicles(vehs);
  }, [fleetId]);

  const handleAddVehicle = useCallback(async (data: VehicleFormData) => {
    if (!fleetId || !user?.companyId) throw new Error("Flotte non chargée");
    await addVehicle(fleetId, user.companyId, data);
    await refreshVehicles();
  }, [fleetId, user?.companyId, refreshVehicles]);

  const handleUpdateVehicle = useCallback(async (vehicleId: string, data: Partial<VehicleFormData>) => {
    if (!fleetId) throw new Error("Flotte non chargée");
    await updateVehicle(fleetId, vehicleId, data);
    await refreshVehicles();
  }, [fleetId, refreshVehicles]);

  return { company, fleetId, vehicles, vehicleCount: vehicles.length, loading, addVehicle: handleAddVehicle, updateVehicle: handleUpdateVehicle, refreshVehicles };
}
