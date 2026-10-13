import { apiPost } from "../../../helpers/apiHelper";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export const login = ({ email, password }: LoginPayload) =>
  apiPost<{ user: AuthUser; token: string }>("/auth/login", { email, password }, false);

export const register = ({ name, email, password }: RegisterPayload) =>
  apiPost("/auth/register", { name, email, password }, false);

export const logout = () => apiPost("/auth/logout");
