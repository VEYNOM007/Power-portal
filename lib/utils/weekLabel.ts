import type { Timestamp } from "firebase/firestore";

/** Retourne le label ISO de la semaine courante — format "2026-W14" */
export function getISOWeekLabel(): string {
  const now = new Date();
  const thursday = new Date(now);
  thursday.setDate(now.getDate() + (4 - (now.getDay() || 7)));
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${thursday.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

/** Formate un Date en label lisible : "Semaine 14 — 2026" */
export function getCurrentWeekLabel(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return `Semaine ${weekNum} — ${now.getFullYear()}`;
}

/** Formate une Date ou Timestamp Firestore en date lisible */
export function formatDate(ts: Timestamp | Date | null): string {
  if (!ts) return "—";
  const d = ts instanceof Date ? ts : ts.toDate();
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

/** Jours écoulés depuis une Date */
export function daysSince(ts: Date | null): number | null {
  if (!ts) return null;
  return (Date.now() - ts.getTime()) / 86400000;
}
