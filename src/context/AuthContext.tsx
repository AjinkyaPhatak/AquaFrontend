"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { apiService, User } from "@/lib/api";
// firebase
import { auth, signInWithGoogle } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // existing backend methods
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  // firebase helpers
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithFirebaseEmail: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  registerWithFirebaseEmail: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function getFirebaseFriendlyError(error: unknown, fallback: string) {
  const message = getErrorMessage(error, fallback);

  if (message.includes("auth/unauthorized-domain")) {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "this site";
    return `Google sign-in is not authorized for ${origin}. Add this domain in Firebase Console -> Authentication -> Settings -> Authorized domains, then try again.`;
  }

  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastSyncedIdTokenRef = useRef<string | null>(null);
  const router = useRouter();

  const clearSession = useCallback(() => {
    lastSyncedIdTokenRef.current = null;
    setUser(null);
    localStorage.removeItem("token");
  }, []);

  const applyAuthResult = useCallback(
    (data: { user: User; access_token: string } | undefined) => {
      if (!data) {
        clearSession();
        return;
      }

      localStorage.setItem("token", data.access_token);
      setUser(data.user);
    },
    [clearSession],
  );

  const restoreBackendSession = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    const { data, error } = await apiService.getMe();
    if (data && !error) {
      setUser(data);
    } else {
      clearSession();
    }
  }, [clearSession]);

  const syncFirebaseSession = useCallback(
    async (fbUser: FirebaseUser, force = false) => {
      const idToken = await fbUser.getIdToken(force);

      if (!force && lastSyncedIdTokenRef.current === idToken) {
        return { success: true as const };
      }

      const { data, error } = await apiService.loginWithFirebase(idToken);
      if (data) {
        lastSyncedIdTokenRef.current = idToken;
        applyAuthResult(data);
        return { success: true as const };
      }

      console.warn("[AuthContext] Firebase token could not be exchanged", error);
      clearSession();
      return {
        success: false as const,
        error: error || "Firebase session could not be synced",
      };
    },
    [applyAuthResult, clearSession],
  );

  const syncFirebaseRegistration = useCallback(
    async (fbUser: FirebaseUser) => {
      const idToken = await fbUser.getIdToken(true);
      const { data, error } = await apiService.registerWithFirebase(idToken);

      if (data) {
        lastSyncedIdTokenRef.current = idToken;
        applyAuthResult(data);
        return { success: true as const };
      }

      console.warn(
        "[AuthContext] Firebase registration token could not be exchanged",
        error,
      );
      clearSession();
      return {
        success: false as const,
        error: error || "Firebase registration could not be synced",
      };
    },
    [applyAuthResult, clearSession],
  );

  // keep listen for firebase changes so that the UI can react if the user
  // signs in or out using another window/tab or provider.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          await syncFirebaseSession(fbUser);
        } else {
          await restoreBackendSession();
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [restoreBackendSession, syncFirebaseSession]);

  // traditional email/password login via backend
  const login = async (email: string, password: string) => {
    console.log("[AuthContext] Login attempt for:", email);
    const { data, error } = await apiService.login(email, password);

    if (error) {
      console.error("[AuthContext] Login failed:", error);
      return { success: false, error };
    }

    if (data) {
      console.log(
        "[AuthContext] Login successful, storing token and user data",
      );
      localStorage.setItem("token", data.access_token);
      setUser(data.user);
      return { success: true };
    }

    console.error("[AuthContext] Login failed: No data received");
    return { success: false, error: "Login failed" };
  };

  // firebase email/password login followed by backend exchange
  const loginWithFirebaseEmail = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const result = await syncFirebaseSession(cred.user, true);
      if (result.success) {
        return { success: true };
      }
      return {
        success: false,
        error: result.error || "Login failed",
      };
    } catch (err: unknown) {
      console.error("[AuthContext] Firebase login error", err);

      const firebaseError = getErrorMessage(err, "");
      if (
        firebaseError.includes("auth/invalid-credential") ||
        firebaseError.includes("auth/user-not-found") ||
        firebaseError.includes("auth/invalid-login-credentials")
      ) {
        console.warn(
          "[AuthContext] Falling back to backend login for legacy account",
        );
        return login(email, password);
      }

      return {
        success: false,
        error: getFirebaseFriendlyError(err, "Firebase authentication failed"),
      };
    }
  };

  // social/provider login (google for now)
  const loginWithGoogle = async () => {
    try {
      const firebaseUser = await signInWithGoogle();
      const result = await syncFirebaseSession(firebaseUser, true);
      if (result.success) {
        return { success: true };
      }
      return {
        success: false,
        error: result.error || "Login failed",
      };
    } catch (err: unknown) {
      console.error("[AuthContext] Google sign-in failed", err);
      return {
        success: false,
        error: getFirebaseFriendlyError(err, "Firebase Google sign-in failed"),
      };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    console.log("[AuthContext] Register attempt for:", email);
    const { data, error } = await apiService.register(name, email, password);

    if (error) {
      console.error("[AuthContext] Registration failed:", error);
      return { success: false, error };
    }

    if (data) {
      console.log(
        "[AuthContext] Registration successful, storing token and user data",
      );
      localStorage.setItem("token", data.access_token);
      setUser(data.user);
      return { success: true };
    }

    console.error("[AuthContext] Registration failed: No data received");
    return { success: false, error: "Registration failed" };
  };

  // firebase email/password registration + backend exchange
  const registerWithFirebaseEmail = async (
    name: string,
    email: string,
    password: string,
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const result = await syncFirebaseRegistration(cred.user);
      if (result.success) {
        return { success: true };
      }
      return {
        success: false,
        error: result.error || "Registration failed",
      };
    } catch (err: unknown) {
      console.error("[AuthContext] Firebase registration error", err);
      return {
        success: false,
        error: getFirebaseFriendlyError(err, "Firebase registration failed"),
      };
    }
  };

  const logout = () => {
    // clear both firebase and backend tokens
    firebaseSignOut(auth).catch(() => {});
    clearSession();
    router.push("/login");
  };

  const refreshUser = async () => {
    const { data } = await apiService.getMe();
    if (data) {
      setUser(data);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        loginWithFirebaseEmail,
        registerWithFirebaseEmail,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
