<script setup lang="ts">
import { onMounted } from "vue";
import { useUsersStore } from "../states/usersStore";
import { useInput } from "../../../hooks/useInput";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const store = useUsersStore();
const [name, onNameChange] = useInput("");
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange, resetPassword] = useInput("");
const [newPassword, onNewPasswordChange, resetNewPassword] = useInput("");
const [confirmation, onConfirmationChange, resetConfirmation] = useInput("");

async function loadProfile() {
  await store.fetchProfile();
  if (store.profile) {
    name.value = store.profile.name;
    email.value = store.profile.email;
  }
}

onMounted(loadProfile);

async function onUpdateProfile() {
  const response = await store.updateProfile(name.value, email.value);
  if (response.success) {
    await showSuccessDialog(response.message);
  } else {
    await showErrorDialog(response.message);
  }
}

async function onPhotoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files![0];
  if (!file) {
    return;
  }
  const response = await store.changePhoto(file);
  if (response.success) {
    await showSuccessDialog(response.message);
    await loadProfile();
  } else {
    await showErrorDialog(response.message);
  }
}

async function onChangePassword() {
  const response = await store.changePassword(password.value, newPassword.value, confirmation.value);
  if (response.success) {
    resetPassword();
    resetNewPassword();
    resetConfirmation();
    await showSuccessDialog(response.message);
  } else {
    await showErrorDialog(response.message);
  }
}
</script>

<template>
  <section aria-labelledby="profile-title" class="space-y-6">
    <div>
      <h1 id="profile-title" class="text-2xl font-bold text-slate-900">Profil Saya</h1>
      <p class="text-slate-700">Kelola data akun, foto, dan kata sandi.</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div class="flex items-center gap-4">
          <img
            v-if="store.profile && store.profile.photo"
            :src="store.profile.photo"
            alt="Foto profil"
            width="64"
            height="64"
            class="h-16 w-16 rounded-full object-cover"
          />
          <span
            v-else
            class="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-800"
            aria-hidden="true"
          >
            {{ name.charAt(0).toUpperCase() }}
          </span>
          <div>
            <label for="profile-photo" class="mb-1 block text-sm font-semibold text-slate-800">Ganti foto profil</label>
            <input id="profile-photo" type="file" accept="image/*" class="text-sm text-slate-800" @change="onPhotoChange" />
          </div>
        </div>

        <form class="space-y-4" @submit.prevent="onUpdateProfile">
          <h2 class="text-lg font-bold text-slate-900">Data akun</h2>
          <div>
            <label for="profile-name" class="mb-1 block text-sm font-semibold text-slate-800">Nama</label>
            <input
              id="profile-name"
              type="text"
              required
              class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900"
              :value="name"
              @input="onNameChange"
            />
          </div>
          <div>
            <label for="profile-email" class="mb-1 block text-sm font-semibold text-slate-800">Email</label>
            <input
              id="profile-email"
              type="email"
              required
              class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900"
              :value="email"
              @input="onEmailChange"
            />
          </div>
          <button
            type="submit"
            :disabled="store.isSaving"
            class="rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-800 disabled:opacity-60"
          >
            Simpan Perubahan
          </button>
        </form>
      </div>

      <form class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6" @submit.prevent="onChangePassword">
        <h2 class="text-lg font-bold text-slate-900">Ubah kata sandi</h2>
        <div>
          <label for="profile-password" class="mb-1 block text-sm font-semibold text-slate-800">Kata sandi saat ini</label>
          <input
            id="profile-password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900"
            :value="password"
            @input="onPasswordChange"
          />
        </div>
        <div>
          <label for="profile-new-password" class="mb-1 block text-sm font-semibold text-slate-800">Kata sandi baru</label>
          <input
            id="profile-new-password"
            type="password"
            required
            autocomplete="new-password"
            class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900"
            :value="newPassword"
            @input="onNewPasswordChange"
          />
        </div>
        <div>
          <label for="profile-confirmation" class="mb-1 block text-sm font-semibold text-slate-800">Konfirmasi kata sandi baru</label>
          <input
            id="profile-confirmation"
            type="password"
            required
            autocomplete="new-password"
            class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900"
            :value="confirmation"
            @input="onConfirmationChange"
          />
        </div>
        <button
          type="submit"
          :disabled="store.isSaving"
          class="rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-800 disabled:opacity-60"
        >
          Ubah Kata Sandi
        </button>
      </form>
    </div>
  </section>
</template>
