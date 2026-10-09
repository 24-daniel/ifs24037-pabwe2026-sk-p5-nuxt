<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { LogOut, Menu } from "lucide-vue-next";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";

const emit = defineEmits<{ (e: "toggle-sidebar"): void }>();

const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();

onMounted(() => {
  if (!usersStore.profile) {
    usersStore.fetchProfile();
  }
});

async function onLogout() {
  authStore.logout();
  await router.replace("/auth/login");
}
</script>

<template>
  <header class="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
    <button
      type="button"
      aria-label="Buka menu navigasi"
      class="rounded-lg p-2 text-slate-800 hover:bg-slate-100 focus:outline-2 focus:outline-indigo-700 lg:hidden"
      @click="emit('toggle-sidebar')"
    >
      <Menu :size="22" aria-hidden="true" />
    </button>

    <div class="ml-auto flex items-center gap-4">
      <div class="text-right">
        <p class="text-sm font-semibold text-slate-900">
          {{ usersStore.profile ? usersStore.profile.name : "Memuat..." }}
        </p>
        <p class="text-xs text-slate-700">
          {{ usersStore.profile ? usersStore.profile.email : "-" }}
        </p>
      </div>
      <span class="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 sm:inline-flex">
        <span class="h-2 w-2 rounded-full bg-emerald-600"></span>
        Sesi aktif
      </span>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 focus:outline-2 focus:outline-indigo-700"
        @click="onLogout"
      >
        <LogOut :size="16" aria-hidden="true" />
        Keluar
      </button>
    </div>
  </header>
</template>
