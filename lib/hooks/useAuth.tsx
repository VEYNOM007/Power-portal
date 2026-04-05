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
    const unsub = onPortalAuthChange((pu) => {
      setUser(pu);
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const portalUser = await loginAndVerify(email, password);
      // Wait for onPortalAuthChange to update the state naturally,
      // or set it here for immediate navigation
      setUser(portalUser);
      
      const { auth } = await import("../firebase/config");
      const idToken = await auth.currentUser?.getIdToken();
      if (idToken) {
        document.cookie = `__session=${idToken}; path=/; max-age=86400; SameSite=Lax`;
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Protected routes — check session cookie
  /*
  const session = req.cookies.get("__session")?.value;

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  */
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
