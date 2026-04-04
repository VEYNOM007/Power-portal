"use client";

import { Suspense, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isActivated = searchParams.get("activated") === "true";
  const companyName = searchParams.get("company");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Small delay to ensure __session cookie is propagated before redirect
      await new Promise((r) => setTimeout(r, 150));
      router.replace("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur de connexion";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
    >
      {isActivated && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
          <strong>Mot de passe créé ✓</strong>
          {companyName && (
            <span> Connectez-vous pour accéder à l&apos;espace <strong>{decodeURIComponent(companyName)}</strong>.</span>
          )}
          <br />
          <span className="text-xs text-green-700">
            Pensez à mettre cette page en favoris pour y revenir directement.
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
          placeholder="gestionnaire@entreprise.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2463]"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#00A651] text-white font-semibold py-2.5 rounded-lg hover:bg-[#008f45] transition-colors disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl font-bold text-[#0A2463]">⚡ Power</span>
          <p className="mt-2 text-sm text-gray-500">
            Portail de gestion de flotte
          </p>
        </div>

        <Suspense fallback={<div className="h-64 animate-pulse bg-gray-100 rounded-xl" />}>
          <LoginForm />
        </Suspense>

        <p className="mt-4 text-center text-xs text-gray-400">
          Power - Livraison de Carburant
        </p>
      </div>
    </div>
  );
}
