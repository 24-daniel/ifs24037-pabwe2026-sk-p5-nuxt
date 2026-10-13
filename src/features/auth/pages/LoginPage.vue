<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useInput } from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";
import { isSuccess } from "../../../helpers/apiHelper";
import { extractErrorMessage, isValidEmail, showErrorDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();
const [email] = useInput("");
const [password] = useInput("");
const errors = ref<Record<string, string>>({});

function validate(): boolean {
  const result: Record<string, string> = {};
  if (!email.value.trim()) result.email = "Email wajib diisi";
  else if (!isValidEmail(email.value)) result.email = "Format email tidak valid";
  if (!password.value) result.password = "Kata sandi wajib diisi";
  errors.value = result;
  return Object.keys(result).length === 0;
}

async function onSubmit() {
  if (!validate()) return;
  const response = await authStore.login({ email: email.value.trim(), password: password.value });
  if (isSuccess(response)) {
    router.push("/");
  } else {
    showErrorDialog(extractErrorMessage(response), "Login gagal");
  }
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-extrabold tracking-tight">Masuk ke akunmu</h1>
    <p class="mt-2 text-sm text-slate-600">Gunakan akun Delcom untuk melihat dan mencatat arus kasmu.</p>

    <form class="mt-8 space-y-5" novalidate @submit.prevent="onSubmit">
      <div>
        <label class="label" for="email">Email</label>
        <input id="email" v-model="email" type="email" class="field" placeholder="nama@del.ac.id" autocomplete="email" />
        <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
      </div>
      <div>
        <label class="label" for="password">Kata sandi</label>
        <input id="password" v-model="password" type="password" class="field" placeholder="Kata sandi" autocomplete="current-password" />
        <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
      </div>
      <button type="submit" class="btn btn-primary w-full" :disabled="authStore.isLoading">
        {{ authStore.isLoading ? "Memproses…" : "Masuk" }}
      </button>
    </form>

    <p class="mt-6 text-sm text-slate-600">
      Belum punya akun?
      <RouterLink to="/auth/register" class="font-semibold text-plum-900 underline">Daftar sekarang</RouterLink>
    </p>
  </div>
</template>
