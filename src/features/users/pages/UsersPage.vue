<script setup lang="ts">
import { onMounted } from "vue";
import { useUsersStore } from "../states/usersStore";
import { formatDateTime } from "../../../helpers/toolsHelper";

const store = useUsersStore();

onMounted(() => store.fetchUsers());
</script>

<template>
  <section aria-labelledby="users-title" class="space-y-6">
    <div>
      <h1 id="users-title" class="text-2xl font-bold text-slate-900">Direktori Pengguna</h1>
      <p class="text-slate-700">Daftar seluruh pengguna yang terdaftar di sistem.</p>
    </div>

    <p v-if="store.isLoading" class="text-slate-700">Memuat data...</p>
    <p v-else-if="store.users.length === 0" class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-800">
      Belum ada pengguna.
    </p>

    <ul v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <li v-for="user in store.users" :key="user.id" class="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <img
          v-if="user.photo"
          :src="user.photo"
          :alt="`Foto ${user.name}`"
          width="48"
          height="48"
          class="h-12 w-12 rounded-full object-cover"
        />
        <span
          v-else
          class="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-800"
          aria-hidden="true"
        >
          {{ user.name.charAt(0).toUpperCase() }}
        </span>
        <div class="min-w-0">
          <p class="truncate font-semibold text-slate-900">{{ user.name }}</p>
          <p class="truncate text-sm text-slate-700">{{ user.email }}</p>
          <p class="text-xs text-slate-700">Bergabung {{ formatDateTime(user.created_at) }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
