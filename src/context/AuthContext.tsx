"use client";

import {
  createContext,
  useContext,
  useEffect,
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // check backend token or firebase state and sync both
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    // if firebase already has a logged-in user, use its ID token to authenticate backend
    const fbUser = auth.currentUser;
    if (fbUser) {
      const idToken = await fbUser.getIdToken();
      const { data, error } = await apiService.loginWithFirebase(idToken);
      if (data) {
        setUser(data.user);
        localStorage.setItem("token", data.access_token);
      } else {
        console.warn(
          "[AuthContext] Firebase token could not be exchanged",
          error,
        );
      }
      setIsLoading(false);
      return;
    }

    // otherwise fall back to normal token stored from previous session
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await apiService.getMe();
    if (data && !error) {
      setUser(data);
    } else {
      localStorage.removeItem("token");
    }
    setIsLoading(false);
  }, []);

  // keep listen for firebase changes so that the UI can react if the user
  // signs in or out using another window/tab or provider.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // when firebase signs in, exchange token with our backend
        const idToken = await fbUser.getIdToken();
        const { data } = await apiService.loginWithFirebase(idToken);
        if (data) {
          setUser(data.user);
          localStorage.setItem("token", data.access_token);
        }
      } else {
        // firebase logged out
        setUser(null);
        localStorage.removeItem("token");
      }
      setIsLoading(false);
    });

    // initial check
    checkAuth();

    return () => unsubscribe();
  }, [checkAuth]);

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
      const idToken = await cred.user.getIdToken();
      const { data, error } = await apiService.loginWithFirebase(idToken);
      if (error) {
        return { success: false, error };
      }
      if (data) {
        localStorage.setItem("token", data.access_token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: "Login failed" };
    } catch (err: any) {
      console.error("[AuthContext] Firebase login error", err);
      return {
        success: false,
        error: err.message || "Firebase authentication failed",
      };
    }
  };

  // social/provider login (google for now)
  const loginWithGoogle = async () => {
    try {
      const idToken = await signInWithGoogle();
      const { data, error } = await apiService.loginWithFirebase(idToken);
      if (error) {
        return { success: false, error };
      }
      if (data) {
        localStorage.setItem("token", data.access_token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: "Login failed" };
    } catch (err: any) {
      console.error("[AuthContext] Google sign-in failed", err);
      return {
        success: false,
        error: err.message || "Firebase Google sign-in failed",
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
      const idToken = await cred.user.getIdToken();
      const { data, error } = await apiService.registerWithFirebase(idToken);
      if (error) {
        return { success: false, error };
      }
      if (data) {
        localStorage.setItem("token", data.access_token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: "Registration failed" };
    } catch (err: any) {
      console.error("[AuthContext] Firebase registration error", err);
      return {
        success: false,
        error: err.message || "Firebase registration failed",
      };
    }
  };

  const logout = () => {
    // clear both firebase and backend tokens
    firebaseSignOut(auth).catch(() => {});
    localStorage.removeItem("token");
    setUser(null);
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
