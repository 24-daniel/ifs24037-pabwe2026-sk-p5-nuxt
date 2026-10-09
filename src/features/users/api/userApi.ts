import { apiRequest } from "../../../helpers/apiHelper";

export interface User {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function getUsers() {
  return apiRequest<{ users: User[] }>("/users");
}

export function getMe() {
  return apiRequest<{ user: User }>("/users/me");
}

export function updateMe(name: string, email: string) {
  return apiRequest<{ user: User }>("/users/me", {
    method: "PUT",
    body: { name, email },
  });
}

export function uploadPhoto(file: File) {
  const form = new FormData();
  form.append("photo", file);
  return apiRequest("/users/me/photo", { method: "POST", body: form });
}

export function changePassword(
  password: string,
  newPassword: string,
  newPasswordConfirmation: string
) {
  return apiRequest("/users/password", {
    method: "PUT",
    body: {
      password,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    },
  });
}
