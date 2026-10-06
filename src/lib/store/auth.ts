"use client";

import { create } from "zustand";
import { AuthUser, LoginInput, RegisterInput } from "../schemas/auth";

interface AuthModalOptions {
  tab?: "login" | "register";
  type?: "B2C" | "B2B";
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  isModalOpen: boolean;
  modalTab: "login" | "register";
  modalType: "B2C" | "B2B";

  // Actions
  checkAuth: () => Promise<void>;
  login: (input: LoginInput) => Promise<{ success: boolean; error?: string }>;
  register: (
    input: RegisterInput
  ) => Promise<{ success: boolean; isConflict?: boolean; error?: string }>;
  logout: () => Promise<void>;
  openModal: (options?: AuthModalOptions) => void;
  closeModal: () => void;
  setModalTab: (tab: "login" | "register") => void;
  setModalType: (type: "B2C" | "B2B") => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  isModalOpen: false,
  modalTab: "login",
  modalType: "B2C",

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated && data.user) {
        set({ user: data.user, isInitialized: true, isLoading: false });
      } else {
        set({ user: null, isInitialized: true, isLoading: false });
      }
    } catch {
      set({ user: null, isInitialized: true, isLoading: false });
    }
  },

  login: async (input) => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        set({
          user: data.user,
          isLoading: false,
          isModalOpen: false,
        });
        return { success: true };
      }

      set({ isLoading: false });
      return {
        success: false,
        error: data.error || "Avtorizatsiyadan o'tib bo'lmadi",
      };
    } catch (err) {
      set({ isLoading: false });
      return {
        success: false,
        error: err instanceof Error ? err.message : "Tarmoq xatosi",
      };
    }
  },

  register: async (input) => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();

      if (res.status === 409 || data.isConflict) {
        set({ isLoading: false });
        return {
          success: false,
          isConflict: true,
          error: data.error || "Ushbu raqam allaqachon mavjud, iltimos tizimga kiring!",
        };
      }

      if (res.ok && data.success && data.user) {
        set({
          user: data.user,
          isLoading: false,
          isModalOpen: false,
        });
        return { success: true };
      }

      set({ isLoading: false });
      return {
        success: false,
        error: data.error || "Ro'yxatdan o'tishda xatolik yuz berdi",
      };
    } catch (err) {
      set({ isLoading: false });
      return {
        success: false,
        error: err instanceof Error ? err.message : "Tarmoq xatosi",
      };
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await fetch("/api/auth/logout", { method: "POST" });
      set({ user: null, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  openModal: (options) => {
    set({
      isModalOpen: true,
      modalTab: options?.tab || "login",
      modalType: options?.type || "B2C",
    });
  },

  closeModal: () => {
    set({ isModalOpen: false });
  },

  setModalTab: (tab) => set({ modalTab: tab }),
  setModalType: (type) => set({ modalType: type }),
}));
