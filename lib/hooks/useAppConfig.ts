import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

export interface FuelConfig {
  id: string;
  label: string;
  price: number;
  isAvailable: boolean;
}

export interface AppConfig {
  fuelTypes: FuelConfig[];
  // autres configs...
}

const DEFAULT_FUEL_TYPES: FuelConfig[] = [
  { id: "DIESEL", label: "Diesel", price: 1.75, isAvailable: true },
  { id: "ESSENCE_95", label: "Sans Plomb 95", price: 1.85, isAvailable: true },
];

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "settings", "app_config"),
      (docSnap) => {
        if (docSnap.exists()) {
          setConfig(docSnap.data() as AppConfig);
        } else {
          console.warn("app_config not found in Firestore, using defaults");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error loading app config:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const availableFuelTypes = config?.fuelTypes.filter(f => f.isAvailable)
    || DEFAULT_FUEL_TYPES.filter(f => f.isAvailable);

  return { config, availableFuelTypes, loading };
}
