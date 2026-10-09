<script setup lang="ts">
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../states/authStore";
import { useInput } from "../../../hooks/useInput";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();
const [name, onNameChange] = useInput("");
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");

async function onSubmit() {
  const result = await authStore.register(name.value, email.value, password.value);
  if (result.success) {
    await showSuccessDialog(result.message);
    await router.replace("/auth/login");
  } else {
    await showErrorDialog(result.message);
  }
}
</script>

<template>
  <section aria-labelledby="register-title">
    <h1 id="register-title" class="text-2xl font-bold text-slate-900">Buat akun</h1>
    <p class="mt-1 text-slate-700">Daftar untuk mulai mencatat arus kas.</p>

    <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
      <div>
        <label for="register-name-input" class="mb-1 block text-sm font-semibold text-slate-800">Nama lengkap</label>
        <input
          id="register-name-input"
          type="text"
          required
          autocomplete="name"
          placeholder="Nama kamu"
          class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900 focus:outline-2 focus:outline-indigo-700"
          :value="name"
          @input="onNameChange"
        />
      </div>
      <div>
        <label for="register-email-input" class="mb-1 block text-sm font-semibold text-slate-800">Email</label>
        <input
          id="register-email-input"
          type="email"
          required
          autocomplete="email"
          placeholder="nama@email.com"
          class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900 focus:outline-2 focus:outline-indigo-700"
          :value="email"
          @input="onEmailChange"
        />
      </div>
      <div>
        <label for="register-password-input" class="mb-1 block text-sm font-semibold text-slate-800">Kata sandi</label>
        <input
          id="register-password-input"
          type="password"
          required
          autocomplete="new-password"
          placeholder="Buat kata sandi"
          class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900 focus:outline-2 focus:outline-indigo-700"
          :value="password"
          @input="onPasswordChange"
        />
      </div>
      <button
        id="register-submit-button"
        type="submit"
        :disabled="authStore.isLoading"
        class="w-full rounded-lg bg-indigo-700 px-4 py-2.5 font-semibold text-white hover:bg-indigo-800 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-700 disabled:opacity-60"
      >
        {{ authStore.isLoading ? "Memproses..." : "Daftar" }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-700">
      Sudah punya akun?
      <RouterLink to="/auth/login" class="font-semibold text-indigo-700 underline">Masuk</RouterLink>
    </p>
  </section>
</template>
