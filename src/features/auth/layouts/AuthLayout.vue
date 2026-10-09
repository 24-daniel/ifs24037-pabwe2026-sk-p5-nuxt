<script setup lang="ts">
import { RouterView, useRouter } from "vue-router";
import { Wallet } from "lucide-vue-next";
import { useAuthStore } from "../states/authStore";

const router = useRouter();
const authStore = useAuthStore();

if (authStore.isAuthenticated) {
  router.replace("/");
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-indigo-50 via-white to-sky-50 px-4 py-10">
    <header class="mb-6 flex items-center gap-3">
      <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-700 text-white">
        <Wallet :size="24" aria-hidden="true" />
      </span>
      <p class="text-xl font-extrabold text-slate-900">Delcom Cash Flow</p>
    </header>
    <main class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <RouterView />
    </main>
    <footer class="mt-6 text-sm text-slate-700">Catat arus kas dengan rapi dan mudah.</footer>
  </div>
</template>
