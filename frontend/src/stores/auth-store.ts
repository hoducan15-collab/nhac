import { create } from "zustand";
import { User, AuthResponse } from "@/types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (response: AuthResponse) => void;
  setUser: (user: User) => void;
  updateCredits: (balance: number) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (response: AuthResponse) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("userData", JSON.stringify(response.user));
    }
    set({
      user: response.user,
      accessToken: response.accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setUser: (user: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userData", JSON.stringify(user));
    }
    set({ user });
  },

  updateCredits: (balance: number) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, creditsBalance: balance };
      if (typeof window !== "undefined") {
        localStorage.setItem("userData", JSON.stringify(updatedUser));
      }
      return { user: updatedUser };
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
    }
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initialize: () => {
    if (typeof window === "undefined") {
      set({ isLoading: false });
      return;
    }

    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("userData");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      } catch (err) {
        console.error("Failed to parse cached user data", err);
      }
    }

    // Demo/guest initial state if not logged in
    set({
      user: {
        id: "guest-user",
        email: "demo@musicstudio.ai",
        fullName: "Nhạc sĩ Khách",
        roles: ["User"],
        creditsBalance: 50,
        createdAtUtc: new Date().toISOString(),
      },
      accessToken: "demo-guest-token",
      isAuthenticated: true,
      isLoading: false,
    });
  },
}));
