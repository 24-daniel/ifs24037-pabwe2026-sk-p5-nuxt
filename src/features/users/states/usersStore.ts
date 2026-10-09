import { defineStore } from "pinia";
import {
  changePassword,
  getMe,
  getUsers,
  updateMe,
  uploadPhoto,
  type User,
} from "../api/userApi";

export interface UsersState {
  users: User[];
  profile: User | null;
  isLoading: boolean;
  isSaving: boolean;
}

export const useUsersStore = defineStore("users", {
  state: (): UsersState => ({
    users: [],
    profile: null,
    isLoading: false,
    isSaving: false,
  }),
  actions: {
    async fetchUsers() {
      this.isLoading = true;
      const response = await getUsers();
      this.users = response.success ? response.data!.users : [];
      this.isLoading = false;
      return response;
    },
    async fetchProfile() {
      this.isLoading = true;
      const response = await getMe();
      this.profile = response.success ? response.data!.user : null;
      this.isLoading = false;
      return response;
    },
    async updateProfile(name: string, email: string) {
      this.isSaving = true;
      const response = await updateMe(name, email);
      if (response.success) {
        this.profile = response.data!.user;
      }
      this.isSaving = false;
      return response;
    },
    async changePhoto(file: File) {
      this.isSaving = true;
      const response = await uploadPhoto(file);
      this.isSaving = false;
      return response;
    },
    async changePassword(password: string, newPassword: string, confirmation: string) {
      this.isSaving = true;
      const response = await changePassword(password, newPassword, confirmation);
      this.isSaving = false;
      return response;
    },
  },
});
