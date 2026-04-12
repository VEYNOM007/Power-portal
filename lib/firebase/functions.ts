import { httpsCallable } from "firebase/functions";
import { functions } from "./config";

/**
 * Crée un compte Fleet Driver avec envoi automatique d'email
 * Appelle la Cloud Function Firebase 'createFleetDriver'
 *
 * Cette fonction :
 * 1. Crée un compte Firebase Auth avec mot de passe temporaire
 * 2. Envoie un email au driver avec lien de réinitialisation
 * 3. Crée le document user dans Firestore
 *
 * @param data - Données du driver à créer
 * @returns success + employeeUid
 */
export async function createFleetDriver(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}): Promise<{ success: boolean; employeeUid: string }> {
  try {
    const callable = httpsCallable(functions, "createFleetDriver");
    const result = await callable(data);

    return result.data as { success: boolean; employeeUid: string };
  } catch (error: any) {
    console.error("❌ createFleetDriver error:", error);

    // Gestion des erreurs spécifiques
    if (error.code === "already-exists") {
      throw new Error("Un compte avec cet email existe déjà");
    } else if (error.code === "invalid-argument") {
      throw new Error("Email invalide ou champs manquants");
    } else if (error.code === "permission-denied") {
      throw new Error("Vous n'avez pas la permission de créer des drivers");
    }

    throw new Error(error.message || "Impossible de créer le compte Fleet Driver");
  }
}

/**
 * Supprime complètement un compte Fleet Driver
 * Appelle la Cloud Function Firebase 'deleteFleetDriver'
 *
 * Cette fonction :
 * 1. Supprime le compte Firebase Auth
 * 2. Supprime le document Firestore users/{uid}
 * 3. Désassigne son véhicule de la flotte
 *
 * @param data - Données du driver à supprimer
 * @returns success
 */
export async function deleteFleetDriver(data: {
  employeeUid: string;
  companyId: string;
}): Promise<{ success: boolean }> {
  try {
    const callable = httpsCallable(functions, "deleteFleetDriver");
    const result = await callable(data);

    return result.data as { success: boolean };
  } catch (error: any) {
    console.error("❌ deleteFleetDriver error:", error);

    // Gestion des erreurs spécifiques
    if (error.code === "not-found") {
      throw new Error("Employé introuvable");
    } else if (error.code === "permission-denied") {
      throw new Error("Vous n'avez pas la permission de supprimer cet employé");
    } else if (error.code === "failed-precondition") {
      throw new Error("Cet utilisateur n'est pas un Fleet Driver");
    }

    throw new Error(error.message || "Impossible de supprimer le compte Fleet Driver");
  }
}
