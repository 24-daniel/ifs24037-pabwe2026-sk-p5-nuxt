import { defineStore } from "pinia";
import { getAccessToken, putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";
import { loginRequest, registerRequest, type AuthUser } from "../api/authApi";

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
}

export interface ActionResult {
  success: boolean;
  message: string;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: getAccessToken(),
    user: null,
    isLoading: false,
  }),
  getters: {
    isAuthenticated: (state): boolean => !!state.token,
  },
  actions: {
    async login(email: string, password: string): Promise<ActionResult> {
      this.isLoading = true;
      const response = await loginRequest(email, password);
      if (response.success) {
        this.token = response.data!.token;
        this.user = response.data!.user;
        putAccessToken(response.data!.token);
      }
      this.isLoading = false;
      return { success: response.success, message: response.message };
    },
    async register(name: string, email: string, password: string): Promise<ActionResult> {
      this.isLoading = true;
      const response = await registerRequest(name, email, password);
      this.isLoading = false;
      return { success: response.success, message: response.message };
    },
    logout(): void {
      removeAccessToken();
      this.token = null;
      this.user = null;
    },
  },
});
