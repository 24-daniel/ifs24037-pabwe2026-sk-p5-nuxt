<script setup lang="ts">
import { ref, watch } from "vue";
import { Camera } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { useUsersStore } from "../states/usersStore";
import { isSuccess, type ApiResponse } from "../../../helpers/apiHelper";
import {
  extractErrorMessage,
  getInitials,
  hasCustomPhoto,
  isValidEmail,
  resolveImageUrl,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const MAX_SIZE = 2 * 1024 * 1024;

const store = useUsersStore();
const [name, onNameChange] = useInput("");
const [email, onEmailChange] = useInput("");
const [password, , resetPassword] = useInput("");
const [newPassword, , resetNewPassword] = useInput("");
const [confirmation, , resetConfirmation] = useInput("");
const profileErrors = ref<Record<string, string>>({});
const passwordErrors = ref<Record<string, string>>({});

watch(
  () => store.profile,
  (profile) => {
    if (profile) {
      onNameChange(profile.name);
      onEmailChange(profile.email);
    }
  },
  { immediate: true },
);

async function report(response: ApiResponse, title: string): Promise<boolean> {
  if (isSuccess(response)) {
    await showSuccessDialog(response.message, title);
    return true;
  }
  showErrorDialog(extractErrorMessage(response));
  return false;
}

async function onProfileSubmit() {
  const errors: Record<string, string> = {};
  if (!name.value.trim()) errors.name = "Nama wajib diisi";
  if (!isValidEmail(email.value)) errors.email = "Format email tidak valid";
  profileErrors.value = errors;
  if (Object.keys(errors).length > 0) return;

  const response = await store.updateProfile({ name: name.value.trim(), email: email.value.trim() });
  if (await report(response, "Profil diperbarui")) store.fetchProfile();
}

async function onPhotoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files![0];
  if (!file) return;
  if (!file.type.startsWith("image/") || file.size > MAX_SIZE) {
    showErrorDialog("Foto harus berupa gambar dengan ukuran maksimal 2 MB");
    return;
  }
  const response = await store.uploadPhoto(file);
  if (await report(response, "Foto diperbarui")) store.fetchProfile();
}

async function onPasswordSubmit() {
  const errors: Record<string, string> = {};
  if (!password.value) errors.password = "Kata sandi saat ini wajib diisi";
  if (newPassword.value.length < 6) errors.newPassword = "Kata sandi baru minimal 6 karakter";
  if (confirmation.value !== newPassword.value) errors.confirmation = "Konfirmasi tidak sama dengan kata sandi baru";
  passwordErrors.value = errors;
  if (Object.keys(errors).length > 0) return;

  const response = await store.changePassword({
    password: password.value,
    new_password: newPassword.value,
    new_password_confirmation: confirmation.value,
  });
  if (await report(response, "Kata sandi diperbarui")) {
    resetPassword();
    resetNewPassword();
    resetConfirmation();
  }
}
</script>

<template>
  <div class="max-w-3xl">
    <h1 class="text-3xl font-extrabold tracking-tight">Profil Saya</h1>
    <p class="mt-1 text-sm text-slate-600">Kelola data akun, foto, dan kata sandimu.</p>

    <section class="panel mt-6 flex items-center gap-5 p-6" aria-label="Foto profil">
      <img v-if="hasCustomPhoto(store.profile?.photo)" :src="resolveImageUrl(store.profile.photo)" alt="Foto profil" class="size-20 rounded-full object-cover" />
      <span v-else class="grid size-20 place-items-center rounded-full bg-plum-900 text-xl font-bold text-white" aria-hidden="true">
        {{ getInitials(store.profile?.name) }}
      </span>
      <div>
        <p class="text-lg font-extrabold">{{ store.profile?.name ?? "-" }}</p>
        <label class="btn btn-ghost mt-2 cursor-pointer text-xs">
          <Camera :size="14" aria-hidden="true" />
          {{ store.isPhotoChange ? "Mengunggah…" : "Ganti foto" }}
          <input type="file" accept="image/*" class="sr-only" aria-label="Unggah foto profil" @change="onPhotoChange" />
        </label>
      </div>
    </section>

    <form class="panel mt-6 space-y-5 p-6" novalidate @submit.prevent="onProfileSubmit">
      <h2 class="text-lg font-extrabold">Data akun</h2>
      <div>
        <label class="label" for="profile-name">Nama</label>
        <input id="profile-name" v-model="name" type="text" class="field" />
        <p v-if="profileErrors.name" class="field-error">{{ profileErrors.name }}</p>
      </div>
      <div>
        <label class="label" for="profile-email">Email</label>
        <input id="profile-email" v-model="email" type="email" class="field" />
        <p v-if="profileErrors.email" class="field-error">{{ profileErrors.email }}</p>
      </div>
      <button type="submit" class="btn btn-primary" :disabled="store.isProfileChange">
        {{ store.isProfileChange ? "Menyimpan…" : "Simpan profil" }}
      </button>
    </form>

    <form class="panel mt-6 space-y-5 p-6" novalidate @submit.prevent="onPasswordSubmit">
      <h2 class="text-lg font-extrabold">Ganti kata sandi</h2>
      <div>
        <label class="label" for="current-password">Kata sandi saat ini</label>
        <input id="current-password" v-model="password" type="password" class="field" autocomplete="current-password" />
        <p v-if="passwordErrors.password" class="field-error">{{ passwordErrors.password }}</p>
      </div>
      <div>
        <label class="label" for="new-password">Kata sandi baru</label>
        <input id="new-password" v-model="newPassword" type="password" class="field" autocomplete="new-password" />
        <p v-if="passwordErrors.newPassword" class="field-error">{{ passwordErrors.newPassword }}</p>
      </div>
      <div>
        <label class="label" for="confirm-password">Ulangi kata sandi baru</label>
        <input id="confirm-password" v-model="confirmation" type="password" class="field" autocomplete="new-password" />
        <p v-if="passwordErrors.confirmation" class="field-error">{{ passwordErrors.confirmation }}</p>
      </div>
      <button type="submit" class="btn btn-primary" :disabled="store.isPasswordChange">
        {{ store.isPasswordChange ? "Menyimpan…" : "Ubah kata sandi" }}
      </button>
    </form>
  </div>
</template>
