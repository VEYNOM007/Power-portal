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
    <form onSubmit={handleSubmit} className="space-y-5">
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
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email professionnel
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2463] focus:border-transparent"
          placeholder="gestionnaire@entreprise.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Mot de passe
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2463] focus:border-transparent"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#00A651] text-white font-semibold py-3 rounded-lg hover:bg-[#008f45] transition-colors disabled:opacity-50 cursor-pointer text-sm"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — desktop only */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-[#0A2463] to-[#05143A] relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 -right-10 w-32 h-32 bg-white/5 rounded-full" />

        {/* Top branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">⚡</span>
            <span className="text-3xl font-bold text-white tracking-tight">
              Power Fleet
            </span>
          </div>
          <p className="text-white/60 text-sm ml-14">
            Solutions de Carburant B2B
          </p>
        </div>

        {/* Trust indicators */}
        <div className="relative z-10 space-y-5">
          <div className="flex items-start gap-4">
            <span className="text-2xl">🚗</span>
            <div>
              <p className="text-white font-medium text-sm">
                Gestion temps réel
              </p>
              <p className="text-white/50 text-xs mt-0.5">
                Suivez vos véhicules et commandes en direct
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="text-2xl">📦</span>
            <div>
              <p className="text-white font-medium text-sm">
                Suivi commandes
              </p>
              <p className="text-white/50 text-xs mt-0.5">
                Historique complet et notifications automatiques
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="text-2xl">💶</span>
            <div>
              <p className="text-white font-medium text-sm">
                Facturation automatique
              </p>
              <p className="text-white/50 text-xs mt-0.5">
                Factures mensuelles et rapports détaillés
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/30 text-xs">
          © 2026 Power - Solutions de Carburant B2B
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile-only condensed header */}
          <div className="text-center mb-8 lg:hidden">
            <span className="text-3xl font-bold text-[#0A2463]">
              ⚡ Power Fleet
            </span>
            <p className="mt-1 text-sm text-gray-500">
              Portail de gestion de flotte
            </p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Connexion
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Accédez à votre espace de gestion de flotte
            </p>
          </div>

          <Suspense
            fallback={
              <div className="h-64 animate-pulse bg-gray-100 rounded-xl" />
            }
          >
            <LoginForm />
          </Suspense>

          <p className="mt-6 text-center text-xs text-gray-400">
            Compte créé par votre administrateur
          </p>

          {/* Mobile footer */}
          <p className="mt-3 text-center text-xs text-gray-300 lg:hidden">
            © 2026 Power - Solutions de Carburant B2B
          </p>
        </div>
      </div>
    </div>
  );
}
