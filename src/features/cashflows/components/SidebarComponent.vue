<script setup lang="ts">
import { useRoute } from "vue-router";
import { LayoutDashboard, UserRound, Users, Wallet, X } from "lucide-vue-next";

defineProps<{ open?: boolean }>();
const emit = defineEmits<{ (e: "close"): void }>();

const route = useRoute();

const items = [
  { label: "Ringkasan Arus Kas", to: "/", paths: ["/", "/cash-flows"], icon: LayoutDashboard },
  { label: "Direktori Pengguna", to: "/users", paths: ["/users"], icon: Users },
  { label: "Profil Saya", to: "/profile", paths: ["/profile"], icon: UserRound },
];

const isActive = (paths: string[]) =>
  paths.some((path) => route.path === path || route.path.startsWith(`${path}/`));
</script>

<template>
  <div>
    <div v-if="open" class="fixed inset-0 z-30 bg-plum-950/50 lg:hidden" data-testid="sidebar-backdrop" @click="emit('close')" />
    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-plum-950 p-5 text-white transition-transform lg:translate-x-0"
      :class="open ? 'translate-x-0' : '-translate-x-full'"
      aria-label="Navigasi utama"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-xl bg-saffron-400 text-plum-950">
            <Wallet :size="20" aria-hidden="true" />
          </span>
          <span class="font-extrabold tracking-tight">Delcom Cash Flow</span>
        </div>
        <button type="button" class="rounded-lg p-1.5 text-plum-100 hover:bg-white/10 lg:hidden" aria-label="Tutup menu" @click="emit('close')">
          <X :size="18" aria-hidden="true" />
        </button>
      </div>

      <nav class="mt-10 space-y-1" aria-label="Menu">
        <RouterLink
          v-for="item in items"
          :key="item.label"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition"
          :class="isActive(item.paths) ? 'bg-white text-plum-950' : 'text-plum-100 hover:bg-white/10'"
          @click="emit('close')"
        >
          <component :is="item.icon" :size="18" aria-hidden="true" />
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>
  </div>
</template>
