import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./config";

// ---------- Types ----------

export interface Company {
  id: string;
  name: string;
  siret: string;
  billingEmail: string;
  phone: string;
  billingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  managerFirstName: string;
  managerLastName: string;
  managerEmail: string;
  managerPhone: string;
  status: "active" | "suspended";
  createdAt: Date | null;
}

export interface Fleet {
  id: string;
  companyId: string;
  name: string;
  vehicleCount: number;
  createdAt: Date | null;
}

export interface Vehicle {
  id: string;
  companyId: string;
  fleetId: string;
  plate: string;
  fuelType: string;
  department: string;
  tankCapacityLiters: number | null;
  assignedDriverName: string | null;
  status: "available" | "in-use" | "maintenance";
}

// ---------- Helpers ----------

function toDate(v: unknown): Date | null {
  if (v instanceof Date) return v;
  if (v && typeof v === "object" && "seconds" in (v as DocumentData)) {
    return new Date((v as DocumentData).seconds * 1000);
  }
  return null;
}

function mapCompany(id: string, data: DocumentData): Company {
  return {
    id,
    name: data.name ?? "",
    siret: data.siret ?? "",
    billingEmail: data.billingEmail ?? "",
    phone: data.phone ?? "",
    billingAddress: data.billingAddress ?? {
      street: "",
      city: "",
      postalCode: "",
      country: "",
    },
    managerFirstName: data.managerFirstName ?? "",
    managerLastName: data.managerLastName ?? "",
    managerEmail: data.managerEmail ?? "",
    managerPhone: data.managerPhone ?? "",
    status: data.status ?? "active",
    createdAt: toDate(data.createdAt),
  };
}

function mapVehicle(id: string, data: DocumentData): Vehicle {
  return {
    id,
    companyId: data.companyId ?? "",
    fleetId: data.fleetId ?? "",
    plate: data.plate ?? "",
    fuelType: data.fuelType ?? "diesel",
    department: data.department ?? "",
    tankCapacityLiters: data.tankCapacityLiters ?? null,
    assignedDriverName: data.assignedDriverName ?? null,
    status: data.status ?? "available",
  };
}

// ---------- Queries ----------

export async function getCompany(companyId: string): Promise<Company | null> {
  const snap = await getDoc(doc(db, "companies", companyId));
  if (!snap.exists()) return null;
  return mapCompany(snap.id, snap.data());
}

export async function getFleetByCompany(
  companyId: string
): Promise<Fleet | null> {
  const q = query(collection(db, "fleets"), where("companyId", "==", companyId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return {
    id: d.id,
    companyId: d.data().companyId ?? companyId,
    name: d.data().name ?? "",
    vehicleCount: d.data().vehicleCount ?? 0,
    createdAt: toDate(d.data().createdAt),
  };
}

export async function getVehicles(fleetId: string): Promise<Vehicle[]> {
  const q = query(
    collection(db, "fleets", fleetId, "vehicles"),
    where("status", "!=", "deleted")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapVehicle(d.id, d.data()));
}

export function onCompanySnapshot(
  companyId: string,
  callback: (company: Company) => void
) {
  return onSnapshot(doc(db, "companies", companyId), (snap) => {
    if (snap.exists()) {
      callback(mapCompany(snap.id, snap.data()));
    }
  });
}
