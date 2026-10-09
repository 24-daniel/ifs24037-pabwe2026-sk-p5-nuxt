<script setup lang="ts">
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../states/authStore";
import { useInput } from "../../../hooks/useInput";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");

async function onSubmit() {
  const result = await authStore.login(email.value, password.value);
  if (result.success) {
    await router.replace("/");
  } else {
    await showErrorDialog(result.message);
  }
}
</script>

<template>
  <section aria-labelledby="login-title">
    <h1 id="login-title" class="text-2xl font-bold text-slate-900">Masuk</h1>
    <p class="mt-1 text-slate-700">Masuk untuk mengelola arus kas kamu.</p>

    <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
      <div>
        <label for="login-email-input" class="mb-1 block text-sm font-semibold text-slate-800">Email</label>
        <input
          id="login-email-input"
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
        <label for="login-password-input" class="mb-1 block text-sm font-semibold text-slate-800">Kata sandi</label>
        <input
          id="login-password-input"
          type="password"
          required
          autocomplete="current-password"
          placeholder="Masukkan kata sandi"
          class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900 focus:outline-2 focus:outline-indigo-700"
          :value="password"
          @input="onPasswordChange"
        />
      </div>
      <button
        id="login-submit-button"
        type="submit"
        :disabled="authStore.isLoading"
        class="w-full rounded-lg bg-indigo-700 px-4 py-2.5 font-semibold text-white hover:bg-indigo-800 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-700 disabled:opacity-60"
      >
        {{ authStore.isLoading ? "Memproses..." : "Masuk" }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-700">
      Belum punya akun?
      <RouterLink to="/auth/register" class="font-semibold text-indigo-700 underline">Daftar sekarang</RouterLink>
    </p>
  </section>
</template>
