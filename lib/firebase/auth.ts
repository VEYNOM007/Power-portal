import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  getIdTokenResult,
} from "firebase/auth";
import { auth } from "./config";

export type PortalRole = "FLEET_MANAGER" | "FLEET_DRIVER";

export interface PortalUser {
  uid: string;
  email: string | null;
  role: PortalRole | null;
  companyId: string | null;
}

/** Listen to auth state + custom claims */
export function onPortalAuthChange(
  callback: (user: PortalUser | null) => void
) {
  return onAuthStateChanged(auth, async (fbUser: User | null) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    const tokenResult = await getIdTokenResult(fbUser);
    callback({
      uid: fbUser.uid,
      email: fbUser.email,
      role: (tokenResult.claims.role as PortalRole) ?? null,
      companyId: (tokenResult.claims.companyId as string) ?? null,
    });
  });
}

/** Login + return user with claims */
export async function loginAndVerify(
  email: string,
  password: string
): Promise<PortalUser> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const tokenResult = await getIdTokenResult(cred.user);

  const role = tokenResult.claims.role as PortalRole | undefined;
  if (role !== "FLEET_MANAGER") {
    await firebaseSignOut(auth);
    throw new Error(
      "Accès refusé. Ce portail est réservé aux gestionnaires de flotte."
    );
  }

  return {
    uid: cred.user.uid,
    email: cred.user.email,
    role,
    companyId: (tokenResult.claims.companyId as string) ?? null,
  };
}

/** Sign out + clear session cookie */
export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
  await fetch("/api/auth/session", { method: "DELETE" });
}

/** Create or delete session cookie via API route */
export async function createSessionCookie(idToken: string): Promise<void> {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}
