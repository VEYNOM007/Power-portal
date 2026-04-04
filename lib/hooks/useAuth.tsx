"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onPortalAuthChange,
  PortalUser,
  loginAndVerify,
  logout as portalLogout,
} from "../firebase/auth";

interface AuthContextValue {
  user: PortalUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onPortalAuthChange((portalUser) => {
      setUser(portalUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const portalUser = await loginAndVerify(email, password);

    // Write __session cookie so middleware sees it on next request
    const { auth } = await import("../firebase/config");
    const idToken = await auth.currentUser?.getIdToken();
    if (idToken) {
      document.cookie = `__session=${idToken}; path=/; max-age=86400; SameSite=Lax`;
    }

    setUser(portalUser);
  };

  const logout = async () => {
    // Clear session cookie
    document.cookie = "__session=; path=/; max-age=0";
    await portalLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
