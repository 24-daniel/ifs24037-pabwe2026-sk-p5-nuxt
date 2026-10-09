<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-vue-next";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import ChangeModal from "../modals/ChangeModal.vue";
import {
  formatDateTime,
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const route = useRoute();
const router = useRouter();
const store = useCashFlowsStore();
const showChange = ref(false);
const cashFlowId = route.params.cashFlowId as string;

const sourceLabels: Record<string, string> = {
  cash: "Tunai",
  savings: "Tabungan",
  loans: "Pinjaman",
};

onMounted(() => Promise.all([store.fetchCashFlow(cashFlowId), store.fetchLabels()]));

async function onSaved() {
  showChange.value = false;
  await store.fetchCashFlow(cashFlowId);
}

async function onDelete() {
  const confirmed = await showConfirmDialog("Catatan ini akan dihapus permanen. Lanjutkan?", "Ya, hapus");
  if (!confirmed) {
    return;
  }
  const response = await store.removeCashFlow(cashFlowId);
  if (response.success) {
    await showSuccessDialog(response.message);
    await router.replace("/");
  } else {
    await showErrorDialog(response.message);
  }
}
</script>

<template>
  <section aria-labelledby="detail-title" class="space-y-6">
    <RouterLink to="/" class="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 underline">
      <ArrowLeft :size="16" aria-hidden="true" />
      Kembali ke ringkasan
    </RouterLink>

    <p v-if="store.isLoading" class="text-slate-700">Memuat data...</p>

    <p v-else-if="!store.cashFlow" class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-800">
      Catatan arus kas tidak ditemukan.
    </p>

    <div v-else class="rounded-2xl border border-slate-200 bg-white p-6">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 id="detail-title" class="text-2xl font-bold text-slate-900">{{ store.cashFlow.label }}</h1>
          <span
            class="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold"
            :class="store.cashFlow.type === 'inflow' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'"
          >
            {{ store.cashFlow.type === "inflow" ? "Pemasukan" : "Pengeluaran" }}
          </span>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-800 hover:bg-slate-100"
            @click="showChange = true"
          >
            <Pencil :size="16" aria-hidden="true" />
            Ubah
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-red-700 px-4 py-2 font-semibold text-red-800 hover:bg-red-50"
            @click="onDelete"
          >
            <Trash2 :size="16" aria-hidden="true" />
            Hapus
          </button>
        </div>
      </div>

      <dl class="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-sm font-semibold text-slate-700">Kategori label</dt>
          <dd class="text-slate-900">{{ store.cashFlow.label }}</dd>
        </div>
        <div>
          <dt class="text-sm font-semibold text-slate-700">Sumber dana</dt>
          <dd class="text-slate-900">{{ sourceLabels[store.cashFlow.source] }}</dd>
        </div>
        <div>
          <dt class="text-sm font-semibold text-slate-700">Nominal</dt>
          <dd class="text-xl font-extrabold text-slate-900">{{ formatRupiah(store.cashFlow.nominal) }}</dd>
        </div>
        <div>
          <dt class="text-sm font-semibold text-slate-700">Deskripsi</dt>
          <dd class="text-slate-900">{{ store.cashFlow.description }}</dd>
        </div>
        <div>
          <dt class="text-sm font-semibold text-slate-700">Dibuat pada</dt>
          <dd class="text-slate-900">{{ formatDateTime(store.cashFlow.created_at) }}</dd>
        </div>
        <div>
          <dt class="text-sm font-semibold text-slate-700">Diperbarui pada</dt>
          <dd class="text-slate-900">{{ formatDateTime(store.cashFlow.updated_at) }}</dd>
        </div>
      </dl>
    </div>

    <ChangeModal :open="showChange" :cash-flow="store.cashFlow" :labels="store.labels" @close="showChange = false" @saved="onSaved" />
  </section>
</template>
