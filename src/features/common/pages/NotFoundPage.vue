<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
    <p class="text-6xl font-extrabold text-indigo-700">404</p>
    <h1 class="text-2xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
    <p class="max-w-md text-slate-700">
      Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
    </p>
    <RouterLink
      to="/"
      class="rounded-lg bg-indigo-700 px-5 py-2.5 font-semibold text-white hover:bg-indigo-800 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-700"
    >
      Kembali ke beranda
    </RouterLink>
  </main>
</template>
