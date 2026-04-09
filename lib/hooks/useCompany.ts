"use client";

import { useCallback, useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { useAuth } from "./useAuth";
import { getCompany, getFleetByCompany, getVehicles, addVehicle, updateVehicle, getEmployees, Company, Vehicle, VehicleFormData, Employee } from "../firebase/firestore";
import { functions } from "../firebase/config";

interface CreateEmployeePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function useCompany() {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [fleetId, setFleetId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
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

      // Charger les employés (non bloquant)
      getEmployees(user.companyId!).then(emps => {
        if (!cancelled) {
          setEmployees(emps);
          console.log("✅ Employés chargés:", emps.length);
        }
      }).catch(err => {
        console.warn("⚠️ getEmployees échec:", err.message);
      });
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

  const refreshEmployees = useCallback(async () => {
    if (!user?.companyId) return;
    const emps = await getEmployees(user.companyId).catch(() => []);
    setEmployees(emps);
  }, [user?.companyId]);

  const createEmployee = useCallback(async (data: CreateEmployeePayload) => {
    const callable = httpsCallable<CreateEmployeePayload, { success: boolean; employeeUid: string }>(functions, "createFleetEmployee");
    await callable(data);
    await refreshEmployees();
  }, [refreshEmployees]);

  return { company, fleetId, vehicles, vehicleCount: vehicles.length, employees, loading, addVehicle: handleAddVehicle, updateVehicle: handleUpdateVehicle, refreshVehicles, createEmployee };
}
