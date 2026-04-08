import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  addDoc,
  updateDoc,
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
  status: "active" | "suspended";
  pricePerLiter: number | null;
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
  mileage: number | null;
  assignedDriverName: string | null;
  lastDeliveryAt: Date | null;
  status: "active" | "inactive";
}

export interface FleetOrder {
  id: string;
  companyId: string;
  fleetId: string;
  vehicleId: string;
  vehiclePlate: string;
  requestedBy: string;
  requestedByRole: string;
  litersRequested: number | null;
  litersDelivered: number | null;
  deliveryAddress: { street: string; city: string; postalCode: string; country: string };
  status: "pending" | "assigned" | "in_progress" | "delivered" | "cancelled";
  weekLabel: string;
  powerDriverUid: string | null;
  createdAt: Date | null;
  assignedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
}

export interface InvoiceLineItem {
  orderId: string;
  vehiclePlate: string;
  deliveredAt: Date | null;
  litersDelivered: number;
  pricePerLiter: number;
  amountHT: number;
}

export interface WeeklyInvoice {
  id: string;
  companyId: string;
  weekLabel: string;
  weekStart: Date | null;
  weekEnd: Date | null;
  totalLiters: number;
  totalAmountHT: number;
  pricePerLiter: number;
  status: "draft" | "sent" | "paid";
  lineItems: InvoiceLineItem[];
  pdfUrl: string | null;
  generatedAt: Date | null;
  sentAt: Date | null;
  paidAt: Date | null;
}

// ---------- Collection refs ----------

export const fleetOrdersRef = collection(db, "fleet_orders");
export const weeklyInvoicesRef = collection(db, "weekly_invoices");

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
    status: data.status ?? "active",
    pricePerLiter: data.pricePerLiter ?? null,
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
    mileage: data.mileage ?? null,
    assignedDriverName: data.assignedDriverName ?? null,
    lastDeliveryAt: toDate(data.lastDeliveryAt),
    status: data.status ?? "active",
  };
}

function mapFleetOrder(id: string, data: DocumentData): FleetOrder {
  return {
    id,
    companyId: data.companyId ?? "",
    fleetId: data.fleetId ?? "",
    vehicleId: data.vehicleId ?? "",
    vehiclePlate: data.vehiclePlate ?? "",
    requestedBy: data.requestedBy ?? "",
    requestedByRole: data.requestedByRole ?? "",
    litersRequested: data.litersRequested ?? null,
    litersDelivered: data.litersDelivered ?? null,
    deliveryAddress: data.deliveryAddress ?? { street: "", city: "", postalCode: "", country: "" },
    status: data.status ?? "pending",
    weekLabel: data.weekLabel ?? "",
    powerDriverUid: data.powerDriverUid ?? null,
    createdAt: toDate(data.createdAt),
    assignedAt: toDate(data.assignedAt),
    deliveredAt: toDate(data.deliveredAt),
    cancelledAt: toDate(data.cancelledAt),
  };
}

function mapWeeklyInvoice(id: string, data: DocumentData): WeeklyInvoice {
  return {
    id,
    companyId: data.companyId ?? "",
    weekLabel: data.weekLabel ?? "",
    weekStart: toDate(data.weekStart),
    weekEnd: toDate(data.weekEnd),
    totalLiters: data.totalLiters ?? 0,
    totalAmountHT: data.totalAmountHT ?? 0,
    pricePerLiter: data.pricePerLiter ?? 0,
    status: data.status ?? "draft",
    lineItems: (data.lineItems ?? []).map((item: DocumentData) => ({
      orderId: item.orderId ?? "",
      vehiclePlate: item.vehiclePlate ?? "",
      deliveredAt: toDate(item.deliveredAt),
      litersDelivered: item.litersDelivered ?? 0,
      pricePerLiter: item.pricePerLiter ?? 0,
      amountHT: item.amountHT ?? 0,
    })),
    pdfUrl: data.pdfUrl ?? null,
    generatedAt: toDate(data.generatedAt),
    sentAt: toDate(data.sentAt),
    paidAt: toDate(data.paidAt),
  };
}

// ---------- Queries ----------

export async function getCompany(companyId: string): Promise<Company | null> {
  const snap = await getDoc(doc(db, "companies", companyId));
  if (!snap.exists()) return null;
  return mapCompany(snap.id, snap.data());
}

export async function getFleetByCompany(companyId: string): Promise<Fleet | null> {
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
  const snap = await getDocs(collection(db, "fleets", fleetId, "vehicles"));
  return snap.docs.map((d) => mapVehicle(d.id, d.data()));
}

export interface VehicleFormData {
  plate: string;
  fuelType: string;
  department: string;
  tankCapacityLiters: number | null;
  assignedDriverName: string | null;
}

export async function addVehicle(
  fleetId: string,
  companyId: string,
  data: VehicleFormData
): Promise<string> {
  const ref = await addDoc(collection(db, "fleets", fleetId, "vehicles"), {
    companyId,
    fleetId,
    plate: data.plate.toUpperCase().trim(),
    fuelType: data.fuelType,
    department: data.department.trim(),
    tankCapacityLiters: data.tankCapacityLiters,
    assignedDriverName: data.assignedDriverName?.trim() || null,
    assignedDriverUid: null,
    mileage: null,
    lastDeliveryAt: null,
    status: "active",
    createdAt: new Date(),
  });
  return ref.id;
}

export async function updateVehicle(
  fleetId: string,
  vehicleId: string,
  data: Partial<VehicleFormData>
): Promise<void> {
  const updates: Record<string, unknown> = {};
  if (data.plate !== undefined) updates.plate = data.plate.toUpperCase().trim();
  if (data.fuelType !== undefined) updates.fuelType = data.fuelType;
  if (data.department !== undefined) updates.department = data.department.trim();
  if (data.tankCapacityLiters !== undefined) updates.tankCapacityLiters = data.tankCapacityLiters;
  if (data.assignedDriverName !== undefined) updates.assignedDriverName = data.assignedDriverName?.trim() || null;

  await updateDoc(doc(db, "fleets", fleetId, "vehicles", vehicleId), updates);
}

export function onCompanySnapshot(companyId: string, callback: (company: Company) => void) {
  return onSnapshot(doc(db, "companies", companyId), (snap) => {
    if (snap.exists()) callback(mapCompany(snap.id, snap.data()));
  });
}

/** Real-time fleet orders for a company — last 50 */
export function onFleetOrdersSnapshot(companyId: string, callback: (orders: FleetOrder[]) => void) {
  return onSnapshot(
    query(fleetOrdersRef, where("companyId", "==", companyId), orderBy("createdAt", "desc"), limit(50)),
    (snap) => callback(snap.docs.map((d) => mapFleetOrder(d.id, d.data())))
  );
}

/** Real-time weekly invoices for a company */
export function onWeeklyInvoicesSnapshot(companyId: string, callback: (invoices: WeeklyInvoice[]) => void) {
  return onSnapshot(
    query(weeklyInvoicesRef, where("companyId", "==", companyId), orderBy("weekStart", "desc")),
    (snap) => callback(snap.docs.map((d) => mapWeeklyInvoice(d.id, d.data())))
  );
}
