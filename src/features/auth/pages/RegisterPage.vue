<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useInput } from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";
import { isSuccess } from "../../../helpers/apiHelper";
import {
  extractErrorMessage,
  isValidEmail,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();
const [name] = useInput("");
const [email] = useInput("");
const [password] = useInput("");
const errors = ref<Record<string, string>>({});

function validate(): boolean {
  const result: Record<string, string> = {};
  if (!name.value.trim()) result.name = "Nama wajib diisi";
  if (!email.value.trim()) result.email = "Email wajib diisi";
  else if (!isValidEmail(email.value)) result.email = "Format email tidak valid";
  if (password.value.length < 6) result.password = "Kata sandi minimal 6 karakter";
  errors.value = result;
  return Object.keys(result).length === 0;
}

async function onSubmit() {
  if (!validate()) return;
  const response = await authStore.register({
    name: name.value.trim(),
    email: email.value.trim(),
    password: password.value,
  });
  if (isSuccess(response)) {
    await showSuccessDialog(response.message, "Pendaftaran berhasil");
    router.push("/auth/login");
  } else {
    showErrorDialog(extractErrorMessage(response), "Pendaftaran gagal");
  }
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-extrabold tracking-tight">Buat akun baru</h1>
    <p class="mt-2 text-sm text-slate-600">Daftar gratis, lalu catat transaksi pertamamu.</p>

    <form class="mt-8 space-y-5" novalidate @submit.prevent="onSubmit">
      <div>
        <label class="label" for="register-name-input">Nama lengkap</label>
        <input id="register-name-input" v-model="name" type="text" class="field" placeholder="Nama lengkap" autocomplete="name" />
        <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
      </div>
      <div>
        <label class="label" for="register-email-input">Email</label>
        <input id="register-email-input" v-model="email" type="email" class="field" placeholder="nama@del.ac.id" autocomplete="email" />
        <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
      </div>
      <div>
        <label class="label" for="register-password-input">Kata sandi</label>
        <input id="register-password-input" v-model="password" type="password" class="field" placeholder="Minimal 6 karakter" autocomplete="new-password" />
        <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
      </div>
      <button id="register-submit-button" type="submit" class="btn btn-primary w-full" :disabled="authStore.isLoading">
        {{ authStore.isLoading ? "Memproses…" : "Daftar" }}
      </button>
    </form>

    <p class="mt-6 text-sm text-slate-600">
      Sudah punya akun?
      <RouterLink to="/auth/login" class="font-semibold text-plum-900 underline">Masuk</RouterLink>
    </p>
  </div>
</template>
