<script setup lang="ts">
import { onMounted } from "vue";
import { useUsersStore } from "../states/usersStore";
import { formatDate, getInitials, resolveImageUrl } from "../../../helpers/toolsHelper";

const store = useUsersStore();
onMounted(() => store.fetchUsers());
</script>

<template>
  <div>
    <h1 class="text-3xl font-extrabold tracking-tight">Direktori Pengguna</h1>
    <p class="mt-1 text-sm text-slate-600">Semua pengguna yang terdaftar di Delcom.</p>

    <p v-if="store.isLoading" class="mt-10 text-center text-sm text-slate-600">Memuat pengguna…</p>
    <p v-else-if="store.users.length === 0" class="panel mt-8 p-10 text-center text-sm text-slate-600">
      Belum ada pengguna terdaftar.
    </p>
    <ul v-else class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <li v-for="user in store.users" :key="user.id" class="panel flex items-center gap-4 p-4" data-testid="user-card">
        <img v-if="user.photo" :src="resolveImageUrl(user.photo)" :alt="user.name" class="size-12 rounded-full object-cover" />
        <span v-else class="grid size-12 place-items-center rounded-full bg-plum-900 font-bold text-white" aria-hidden="true">
          {{ getInitials(user.name) }}
        </span>
        <div class="min-w-0">
          <p class="truncate font-bold">{{ user.name }}</p>
          <p class="truncate text-sm text-slate-600">{{ user.email }}</p>
          <p class="text-xs text-slate-600">Bergabung {{ formatDate(user.created_at) }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>
