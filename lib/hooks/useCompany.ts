"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getCompany, getFleetByCompany, getVehicles, addVehicle, updateVehicle, deleteVehicle, getEmployees, suspendEmployee, unsuspendEmployee, resetAllVehicles, assignVehicleToEmployee, unassignVehicleFromEmployee, Company, Vehicle, VehicleFormData, Employee } from "../firebase/firestore";
import { createFleetDriver, deleteFleetDriver } from "../firebase/functions";

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
        getCompany(user.companyId!).then(async comp => {
          if (!cancelled && comp) {
            setCompany(comp);
            console.log("✅ Infos Entreprise chargées (Statut: " + comp.status + ")");
            
            // Activation automatique si en attente
            if (comp.status === 'pending_activation' as any || (comp.status as string) === 'pending_activation') {
              console.log("⚡ Activation du compte entreprise...");
              try {
                const { updateCompanyStatus } = await import("../firebase/firestore");
                await updateCompanyStatus(user.companyId!, 'active');
                setCompany(prev => prev ? { ...prev, status: 'active' } : null);
                console.log("✅ Compte activé avec succès");
              } catch (err) {
                console.error("❌ Échec de l'activation automatique:", err);
              }
            }
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

  const handleDeleteVehicle = useCallback(async (vehicleId: string) => {
    if (!fleetId) throw new Error("Flotte non chargée");
    await deleteVehicle(fleetId, vehicleId);
    await refreshVehicles();
  }, [fleetId, refreshVehicles]);

  const refreshEmployees = useCallback(async () => {
    if (!user?.companyId) return;
    const emps = await getEmployees(user.companyId).catch(() => []);
    setEmployees(emps);
  }, [user?.companyId]);

  const createEmployee = useCallback(async (data: CreateEmployeePayload) => {
    if (!user?.companyId) throw new Error("Utilisateur non chargé");

    // Appeler la Cloud Function Firebase qui envoie l'email au driver
    const result = await createFleetDriver({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
    });

    console.log("✅ Fleet Driver créé:", result.employeeUid);

    // Rafraîchir la liste des employés
    await refreshEmployees();
  }, [user?.companyId, refreshEmployees]);

  const handleDeleteEmployee = useCallback(async (employeeUid: string) => {
    if (!user?.companyId) throw new Error("Utilisateur non chargé");

    // Appeler la Cloud Function qui supprime Auth + Firestore + désassigne le véhicule
    await deleteFleetDriver({
      employeeUid,
      companyId: user.companyId,
    });

    await refreshEmployees();
    await refreshVehicles(); // Refresh vehicles in case one was unassigned
  }, [user?.companyId, refreshEmployees, refreshVehicles]);

  const handleSuspendEmployee = useCallback(async (employeeUid: string) => {
    await suspendEmployee(employeeUid);
    await refreshEmployees();
  }, [refreshEmployees]);

  const handleUnsuspendEmployee = useCallback(async (employeeUid: string) => {
    await unsuspendEmployee(employeeUid);
    await refreshEmployees();
  }, [refreshEmployees]);

  const handleResetAllVehicles = useCallback(async () => {
    if (!fleetId) throw new Error("Flotte non chargée");
    await resetAllVehicles(fleetId);
    await refreshVehicles();
  }, [fleetId, refreshVehicles]);

  const handleAssignVehicleToEmployee = useCallback(async (vehicleId: string, employeeName: string) => {
    if (!fleetId) throw new Error("Flotte non chargée");
    await assignVehicleToEmployee(fleetId, vehicleId, employeeName);
    await refreshVehicles();
  }, [fleetId, refreshVehicles]);

  const handleUnassignVehicle = useCallback(async (vehicleId: string) => {
    if (!fleetId) throw new Error("Flotte non chargée");
    await unassignVehicleFromEmployee(fleetId, vehicleId);
    await refreshVehicles();
  }, [fleetId, refreshVehicles]);

  return {
    company,
    fleetId,
    vehicles,
    vehicleCount: vehicles.length,
    employees,
    loading,
    addVehicle: handleAddVehicle,
    updateVehicle: handleUpdateVehicle,
    deleteVehicle: handleDeleteVehicle,
    refreshVehicles,
    createEmployee,
    deleteEmployee: handleDeleteEmployee,
    suspendEmployee: handleSuspendEmployee,
    unsuspendEmployee: handleUnsuspendEmployee,
    resetAllVehicles: handleResetAllVehicles,
    assignVehicleToEmployee: handleAssignVehicleToEmployee,
    unassignVehicle: handleUnassignVehicle
  };
}
