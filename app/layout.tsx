import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/useAuth";

export const metadata: Metadata = {
  title: "Power Portal",
  description: "Portail de gestion de flotte Power",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
