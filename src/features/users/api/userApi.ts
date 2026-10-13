import { apiGet, apiPost, apiPut } from "../../../helpers/apiHelper";

export interface User {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChangePasswordPayload {
  password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const getUsers = () => apiGet<{ users: User[] }>("/users");
export const getUserById = (id: number | string) => apiGet<{ user: User }>(`/users/${id}`);
export const getProfile = () => apiGet<{ user: User }>("/users/me");
export const updateProfile = ({ name, email }: { name: string; email: string }) =>
  apiPut<{ user: User }>("/users/me", { name, email });

export const uploadPhoto = (file: File) => {
  const formData = new FormData();
  formData.append("photo", file);
  return apiPost("/users/me/photo", formData);
};

// Sesuai dokumentasi Delcom Open API: PUT /users/password
export const changePassword = ({ password, new_password, new_password_confirmation }: ChangePasswordPayload) =>
  apiPut("/users/password", { password, new_password, new_password_confirmation });
