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
  const [user, setUser] = useState<PortalUser | null>({
    uid: "MOCK_USER_UID",
    email: "mock@entreprise-test.com",
    role: "FLEET_MANAGER",
    companyId: "EMzz4pno0ovtopykVcTc",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock
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
