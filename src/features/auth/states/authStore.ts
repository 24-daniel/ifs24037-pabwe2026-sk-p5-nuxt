import { defineStore } from "pinia";
import * as authApi from "../api/authApi";
import type { LoginPayload, RegisterPayload } from "../api/authApi";
import {
  getAccessToken,
  isSuccess,
  putAccessToken,
  removeAccessToken,
  type ApiResponse,
} from "../../../helpers/apiHelper";

export interface ValidationState {
  message: string;
  errors: Record<string, string[]>;
}

export interface AuthState {
  token: string | null;
  isLoading: boolean;
  isAuthLogin: boolean;
  isAuthRegister: boolean;
  isAuthLogout: boolean;
  validation: ValidationState | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: getAccessToken(),
    isLoading: false,
    // Flag keberhasilan aksi terakhir
    isAuthLogin: false,
    isAuthRegister: false,
    isAuthLogout: false,
    // Status validasi dari server (null jika tidak ada error)
    validation: null,
  }),
  getters: {
    isAuthenticated: (state): boolean => Boolean(state.token),
  },
  actions: {
    startRequest() {
      this.isLoading = true;
      this.validation = null;
    },
    finishRequest(response: ApiResponse): boolean {
      this.isLoading = false;
      const ok = isSuccess(response);
      this.validation = ok ? null : { message: response.message, errors: response.data ?? {} };
      return ok;
    },
    async login(credentials: LoginPayload) {
      this.startRequest();
      this.isAuthLogin = false;
      const response = await authApi.login(credentials);
      if (this.finishRequest(response)) {
        this.token = response.data!.token;
        putAccessToken(this.token);
        this.isAuthLogin = true;
      }
      return response;
    },
    async register(payload: RegisterPayload) {
      this.startRequest();
      this.isAuthRegister = false;
      const response = await authApi.register(payload);
      this.isAuthRegister = this.finishRequest(response);
      return response;
    },
    /** Hapus sesi lokal (dipakai saat logout maupun token kedaluwarsa). */
    clearSession() {
      removeAccessToken();
      this.token = null;
    },
    async logout() {
      this.startRequest();
      this.isAuthLogout = false;
      const response = await authApi.logout();
      this.clearSession();
      this.finishRequest(response);
      this.isAuthLogout = true;
      return response;
    },
  },
});
