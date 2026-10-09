import { apiRequest } from "../../../helpers/apiHelper";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
}

export interface LoginData {
  token: string;
  user: AuthUser;
}

export function loginRequest(email: string, password: string) {
  return apiRequest<LoginData>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function registerRequest(name: string, email: string, password: string) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: { name, email, password },
    auth: false,
  });
}
