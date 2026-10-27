"use client";

import { create } from "zustand";
import {
  AuthUser,
  LoginInput,
  RegisterInput,
  OtpSendInput,
  OtpVerifyInput,
  OtpCompleteInput,
} from "../schemas/auth";

interface AuthModalOptions {
  tab?: "login" | "register";
  type?: "B2C" | "B2B";
}

export interface SendOtpResponse {
  success: boolean;
  phone?: string;
  cooldown?: number;
  expiresIn?: number;
  isTestMode?: boolean;
  devCode?: string;
  retryAfter?: number;
  error?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  isNewUser?: boolean;
  verifiedToken?: string;
  phone?: string;
  user?: AuthUser;
  remainingAttempts?: number;
  reason?: string;
  error?: string;
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
  sendOtp: (input: OtpSendInput) => Promise<SendOtpResponse>;
  verifyOtp: (input: OtpVerifyInput) => Promise<VerifyOtpResponse>;
  completeOtpRegistration: (
    input: OtpCompleteInput
  ) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
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

export const useAuthStore = create<AuthState>((set) => ({
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

  sendOtp: async (input) => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      set({ isLoading: false });

      if (res.ok && data.success) {
        return {
          success: true,
          phone: data.phone,
          cooldown: data.cooldown ?? 60,
          expiresIn: data.expiresIn ?? 120,
          isTestMode: data.isTestMode,
          devCode: data.devCode,
        };
      }

      return {
        success: false,
        retryAfter: data.retryAfter,
        error: data.error || "SMS yuborishda xatolik yuz berdi",
      };
    } catch (err) {
      set({ isLoading: false });
      return {
        success: false,
        error: err instanceof Error ? err.message : "Tarmoq xatosi",
      };
    }
  },

  verifyOtp: async (input) => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // If existing customer in 1C, log in immediately and close modal
        if (!data.isNewUser && data.user) {
          set({
            user: data.user,
            isLoading: false,
            isModalOpen: false,
          });
          return {
            success: true,
            isNewUser: false,
            user: data.user,
          };
        }

        // New customer -> proceed to Step 3 (Name / INN)
        set({ isLoading: false });
        return {
          success: true,
          isNewUser: true,
          verifiedToken: data.verifiedToken,
          phone: data.phone,
        };
      }

      set({ isLoading: false });
      return {
        success: false,
        reason: data.reason,
        remainingAttempts: data.remainingAttempts,
        error: data.error || "Tasdiqlash kodi xato",
      };
    } catch (err) {
      set({ isLoading: false });
      return {
        success: false,
        error: err instanceof Error ? err.message : "Tarmoq xatosi",
      };
    }
  },

  completeOtpRegistration: async (input) => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/auth/otp/complete", {
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
        return { success: true, user: data.user };
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
          error:
            data.error ||
            "Ushbu raqam allaqachon mavjud, iltimos tizimga kiring!",
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
