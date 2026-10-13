import { defineStore } from "pinia";
import * as userApi from "../api/userApi";
import type { ChangePasswordPayload, User } from "../api/userApi";
import { isSuccess, type ApiResponse } from "../../../helpers/apiHelper";

export interface UsersState {
  users: User[];
  user: User | null;
  profile: User | null;
  isLoading: boolean;
  isProfileChange: boolean;
  isProfileChanged: boolean;
  isPhotoChange: boolean;
  isPhotoChanged: boolean;
  isPasswordChange: boolean;
  isPasswordChanged: boolean;
}

type Flag = "isProfileChange" | "isProfileChanged" | "isPhotoChange" | "isPhotoChanged" | "isPasswordChange" | "isPasswordChanged";

export const useUsersStore = defineStore("users", {
  state: (): UsersState => ({
    users: [],
    user: null,
    profile: null,
    isLoading: false,
    isProfileChange: false,
    isProfileChanged: false,
    isPhotoChange: false,
    isPhotoChanged: false,
    isPasswordChange: false,
    isPasswordChanged: false,
  }),
  actions: {
    async fetchUsers() {
      this.isLoading = true;
      const response = await userApi.getUsers();
      this.users = isSuccess(response) ? response.data!.users : [];
      this.isLoading = false;
      return response;
    },
    async fetchUser(id: number | string) {
      this.isLoading = true;
      const response = await userApi.getUserById(id);
      this.user = isSuccess(response) ? response.data!.user : null;
      this.isLoading = false;
      return response;
    },
    async fetchProfile() {
      this.isLoading = true;
      const response = await userApi.getProfile();
      this.profile = isSuccess(response) ? response.data!.user : null;
      this.isLoading = false;
      return response;
    },
    // Menyalakan flag "sedang berjalan" lalu flag "berhasil" untuk aksi mutasi.
    async track(loading: Flag, done: Flag, call: () => Promise<ApiResponse>) {
      this[loading] = true;
      this[done] = false;
      const response = await call();
      this[loading] = false;
      this[done] = isSuccess(response);
      return response;
    },
    updateProfile(payload: { name: string; email: string }) {
      return this.track("isProfileChange", "isProfileChanged", () => userApi.updateProfile(payload));
    },
    uploadPhoto(file: File) {
      return this.track("isPhotoChange", "isPhotoChanged", () => userApi.uploadPhoto(file));
    },
    changePassword(payload: ChangePasswordPayload) {
      return this.track("isPasswordChange", "isPasswordChanged", () => userApi.changePassword(payload));
    },
  },
});
