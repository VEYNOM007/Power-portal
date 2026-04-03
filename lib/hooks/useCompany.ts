"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import {
  getCompany,
  getFleetByCompany,
  getVehicles,
  Company,
  Vehicle,
} from "../firebase/firestore";

export function useCompany() {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.companyId) {
      setCompany(null);
      setVehicles([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const [comp, fleet] = await Promise.all([
          getCompany(user.companyId!),
          getFleetByCompany(user.companyId!),
        ]);

        if (cancelled) return;
        if (comp) setCompany(comp);

        if (fleet) {
          const vehs = await getVehicles(fleet.id);
          if (!cancelled) setVehicles(vehs);
        }
      } catch (err) {
        console.error("useCompany error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.companyId]);

  return { company, vehicles, vehicleCount: vehicles.length, loading };
}
