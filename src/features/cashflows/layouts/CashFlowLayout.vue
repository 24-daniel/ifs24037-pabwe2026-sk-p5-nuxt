<script setup lang="ts">
import { ref } from "vue";
import { RouterView, useRouter } from "vue-router";
import { useAuthStore } from "../../auth/states/authStore";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";

const router = useRouter();
const authStore = useAuthStore();
const sidebarOpen = ref(false);

if (!authStore.isAuthenticated) {
  router.replace("/auth/login");
}
</script>

<template>
  <div v-if="authStore.isAuthenticated" class="min-h-screen bg-slate-50 lg:flex">
    <SidebarComponent :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="flex min-w-0 flex-1 flex-col">
      <NavbarComponent @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
