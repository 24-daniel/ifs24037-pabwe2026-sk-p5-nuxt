<script setup lang="ts">
import { Wallet } from "lucide-vue-next";
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
    <aside
      class="hidden flex-col justify-between bg-plum-950 p-12 text-white lg:flex"
      data-testid="auth-banner"
    >
      <div class="flex items-center gap-3">
        <span class="grid size-11 place-items-center rounded-xl bg-saffron-400 text-plum-950">
          <Wallet :size="22" aria-hidden="true" />
        </span>
        <span class="text-lg font-extrabold tracking-tight">Delcom Cash Flow</span>
      </div>
      <div class="max-w-md">
        <p class="text-4xl/tight font-extrabold tracking-tight">
          Tahu ke mana uangmu pergi sebelum akhir bulan tiba.
        </p>
        <p class="mt-5 text-base/7 text-plum-100">
          Catat pemasukan dan pengeluaran, pisahkan tunai, tabungan, dan pinjaman, lalu lihat saldo bersihmu seketika.
        </p>
      </div>
      <p class="text-sm text-plum-100">Praktikum PABWE 2026 · Delcom Open API</p>
    </aside>

    <main class="flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <span class="grid size-10 place-items-center rounded-xl bg-plum-900 text-saffron-400">
            <Wallet :size="20" aria-hidden="true" />
          </span>
          <span class="text-lg font-extrabold">Delcom Cash Flow</span>
        </div>
        <RouterView />
      </div>
    </main>
  </div>
</template>
