<script setup lang="ts">
import { useRouter } from "vue-router";
import { LogOut, Menu } from "lucide-vue-next";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import { getInitials, resolveImageUrl, showConfirmDialog } from "../../../helpers/toolsHelper";

const emit = defineEmits<{ (e: "toggle-sidebar"): void }>();

const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();

async function onLogout() {
  if (await showConfirmDialog("Kamu akan keluar dari akun ini.", "Keluar?")) {
    await authStore.logout();
    router.push("/auth/login");
  }
}
</script>

<template>
  <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
    <button type="button" class="btn btn-ghost !p-2 lg:hidden" aria-label="Buka menu" @click="emit('toggle-sidebar')">
      <Menu :size="20" aria-hidden="true" />
    </button>
    <p class="hidden items-center gap-2 text-sm font-semibold text-gain-700 lg:flex">
      <span class="size-2 rounded-full bg-gain-700" aria-hidden="true" />
      Sesi aktif
    </p>

    <div class="flex items-center gap-3">
      <div class="flex items-center gap-3">
        <img v-if="usersStore.profile?.photo" :src="resolveImageUrl(usersStore.profile.photo)" alt="" class="size-9 rounded-full object-cover" />
        <span v-else class="grid size-9 place-items-center rounded-full bg-plum-900 text-xs font-bold text-white" aria-hidden="true">
          {{ getInitials(usersStore.profile?.name) }}
        </span>
        <div class="hidden leading-tight sm:block">
          <p class="text-sm font-bold">{{ usersStore.profile?.name ?? "Pengguna" }}</p>
          <p class="text-xs text-slate-600">{{ usersStore.profile?.email ?? "-" }}</p>
        </div>
      </div>
      <button type="button" class="btn btn-ghost" @click="onLogout"><LogOut :size="16" aria-hidden="true" /> Keluar</button>
    </div>
  </header>
</template>
