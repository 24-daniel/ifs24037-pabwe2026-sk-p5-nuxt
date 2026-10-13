<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";

const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();
const sidebarOpen = ref(false);

onMounted(async () => {
  const response = await usersStore.fetchProfile();
  // Token kedaluwarsa / tidak valid -> kembali ke halaman login
  if (response.httpStatus === 401) {
    authStore.clearSession();
    router.replace("/auth/login");
  }
});
</script>

<template>
  <div class="min-h-screen">
    <SidebarComponent :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="lg:pl-64">
      <NavbarComponent @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
