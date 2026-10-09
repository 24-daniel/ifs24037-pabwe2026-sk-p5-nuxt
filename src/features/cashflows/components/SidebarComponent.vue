<script setup lang="ts">
import { RouterLink } from "vue-router";
import { LayoutDashboard, UserRound, Users, Wallet } from "lucide-vue-next";

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: "close"): void }>();

function onNavigate(event: MouseEvent, navigate: (e: MouseEvent) => void) {
  navigate(event);
  emit("close");
}

const menus = [
  { to: "/", label: "Ringkasan Arus Kas", icon: LayoutDashboard },
  { to: "/users", label: "Direktori Pengguna", icon: Users },
  { to: "/profile", label: "Profil Saya", icon: UserRound },
];
</script>

<template>
  <div>
    <button
      v-if="open"
      type="button"
      aria-label="Tutup menu navigasi"
      class="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
      @click="emit('close')"
    ></button>

    <aside
      class="fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white p-4 transition-transform lg:static lg:z-auto lg:min-h-screen lg:translate-x-0"
      :class="open ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="mb-6 flex items-center gap-2 px-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-700 text-white">
          <Wallet :size="20" aria-hidden="true" />
        </span>
        <p class="font-extrabold text-slate-900">Delcom Cash Flow</p>
      </div>
      <nav aria-label="Navigasi utama">
        <ul class="space-y-1">
          <li v-for="menu in menus" :key="menu.to">
            <RouterLink v-slot="{ href, navigate, isExactActive }" :to="menu.to" custom>
              <a
                :href="href"
                :aria-current="isExactActive ? 'page' : undefined"
                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-2 focus:outline-indigo-700"
                :class="isExactActive ? 'bg-indigo-700 text-white' : 'text-slate-800 hover:bg-slate-100'"
                @click="onNavigate($event, navigate)"
              >
                <component :is="menu.icon" :size="18" aria-hidden="true" />
                {{ menu.label }}
              </a>
            </RouterLink>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>
