<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import {
  Eye,
  Landmark,
  Pencil,
  PiggyBank,
  Plus,
  RotateCcw,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-vue-next";
import { useCashFlowsStore, type CashFlow } from "../states/cashFlowsStore";
import AddModal from "../modals/AddModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import {
  formatDateTime,
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  toApiDateTime,
} from "../../../helpers/toolsHelper";

const store = useCashFlowsStore();
const showAdd = ref(false);
const editing = ref<CashFlow | null>(null);
const filters = reactive({ type: "", source: "", label: "", start_date: "", end_date: "" });

const sourceLabels: Record<string, string> = {
  cash: "Tunai",
  savings: "Tabungan",
  loans: "Pinjaman",
};

const cards = computed(() => [
  { key: "net", title: "Total Saldo Kas Bersih", value: store.stats.cashflow, icon: Wallet, tone: "bg-indigo-50 text-indigo-800" },
  { key: "inflow", title: "Total Pemasukan", value: store.stats.total_inflow, icon: TrendingUp, tone: "bg-emerald-50 text-emerald-800" },
  { key: "outflow", title: "Total Pengeluaran", value: store.stats.total_outflow, icon: TrendingDown, tone: "bg-red-50 text-red-800" },
  { key: "cash", title: "Saldo Kas Tunai", value: store.stats.cash, icon: Wallet, tone: "bg-sky-50 text-sky-800" },
  { key: "savings", title: "Saldo Rekening Tabungan", value: store.stats.savings, icon: PiggyBank, tone: "bg-amber-50 text-amber-900" },
  { key: "loans", title: "Saldo Pinjaman", value: store.stats.loans, icon: Landmark, tone: "bg-violet-50 text-violet-800" },
]);

function loadCashFlows() {
  return store.fetchCashFlows({
    type: filters.type,
    source: filters.source,
    label: filters.label,
    start_date: toApiDateTime(filters.start_date, false),
    end_date: toApiDateTime(filters.end_date, true),
  });
}

async function refresh() {
  await Promise.all([loadCashFlows(), store.fetchLabels()]);
}

onMounted(refresh);

function resetFilters() {
  Object.assign(filters, { type: "", source: "", label: "", start_date: "", end_date: "" });
  return loadCashFlows();
}

async function onSaved() {
  showAdd.value = false;
  editing.value = null;
  await refresh();
}

async function onDelete(cashFlow: CashFlow) {
  const confirmed = await showConfirmDialog(`Hapus catatan "${cashFlow.label}"?`, "Ya, hapus");
  if (!confirmed) {
    return;
  }
  const response = await store.removeCashFlow(cashFlow.id);
  if (response.success) {
    await showSuccessDialog(response.message);
    await refresh();
  } else {
    await showErrorDialog(response.message);
  }
}

async function onResetAll() {
  const confirmed = await showConfirmDialog(
    "Seluruh catatan arus kas akan dihapus permanen. Lanjutkan?",
    "Ya, reset semua"
  );
  if (!confirmed) {
    return;
  }
  const response = await store.removeAllCashFlows();
  if (response.success) {
    await showSuccessDialog(response.message);
    await refresh();
  } else {
    await showErrorDialog(response.message);
  }
}
</script>

<template>
  <section aria-labelledby="home-title" class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 id="home-title" class="text-2xl font-bold text-slate-900">Ringkasan Arus Kas</h1>
        <p class="text-slate-700">Pantau pemasukan, pengeluaran, dan saldo kamu.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-800"
          @click="showAdd = true"
        >
          <Plus :size="18" aria-hidden="true" />
          Tambah Transaksi
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-red-700 px-4 py-2 font-semibold text-red-800 hover:bg-red-50"
          @click="onResetAll"
        >
          <Trash2 :size="18" aria-hidden="true" />
          Reset Semua
        </button>
      </div>
    </div>

    <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Ringkasan saldo">
      <li v-for="card in cards" :key="card.key" class="rounded-2xl border border-slate-200 bg-white p-5">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-lg" :class="card.tone">
            <component :is="card.icon" :size="20" aria-hidden="true" />
          </span>
          <p class="text-sm font-semibold text-slate-700">{{ card.title }}</p>
        </div>
        <p class="mt-3 text-2xl font-extrabold text-slate-900">{{ formatRupiah(card.value) }}</p>
      </li>
    </ul>

    <form
      class="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-5"
      aria-label="Filter transaksi"
      @submit.prevent="loadCashFlows"
    >
      <div>
        <label for="filter-type" class="mb-1 block text-sm font-semibold text-slate-800">Jenis</label>
        <select id="filter-type" v-model="filters.type" class="w-full rounded-lg border border-slate-400 px-3 py-2">
          <option value="">Semua</option>
          <option value="inflow">Pemasukan</option>
          <option value="outflow">Pengeluaran</option>
        </select>
      </div>
      <div>
        <label for="filter-source" class="mb-1 block text-sm font-semibold text-slate-800">Sumber dana</label>
        <select id="filter-source" v-model="filters.source" class="w-full rounded-lg border border-slate-400 px-3 py-2">
          <option value="">Semua</option>
          <option value="cash">Tunai</option>
          <option value="savings">Tabungan</option>
          <option value="loans">Pinjaman</option>
        </select>
      </div>
      <div>
        <label for="filter-label" class="mb-1 block text-sm font-semibold text-slate-800">Label</label>
        <select id="filter-label" v-model="filters.label" class="w-full rounded-lg border border-slate-400 px-3 py-2">
          <option value="">Semua</option>
          <option v-for="item in store.labels" :key="item" :value="item">{{ item }}</option>
        </select>
      </div>
      <div>
        <label for="filter-start" class="mb-1 block text-sm font-semibold text-slate-800">Tanggal awal</label>
        <input id="filter-start" v-model="filters.start_date" type="date" class="w-full rounded-lg border border-slate-400 px-3 py-2" />
      </div>
      <div>
        <label for="filter-end" class="mb-1 block text-sm font-semibold text-slate-800">Tanggal akhir</label>
        <input id="filter-end" v-model="filters.end_date" type="date" class="w-full rounded-lg border border-slate-400 px-3 py-2" />
      </div>
      <div class="flex gap-2 sm:col-span-2 lg:col-span-5">
        <button type="submit" class="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700">
          Terapkan Filter
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-800 hover:bg-slate-100"
          @click="resetFilters"
        >
          <RotateCcw :size="16" aria-hidden="true" />
          Reset Filter
        </button>
      </div>
    </form>

    <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table class="w-full min-w-[720px] text-left text-sm">
        <caption class="sr-only">Daftar transaksi arus kas</caption>
        <thead class="bg-slate-100 text-slate-800">
          <tr>
            <th scope="col" class="px-4 py-3 font-semibold">Tanggal</th>
            <th scope="col" class="px-4 py-3 font-semibold">Label</th>
            <th scope="col" class="px-4 py-3 font-semibold">Jenis</th>
            <th scope="col" class="px-4 py-3 font-semibold">Sumber</th>
            <th scope="col" class="px-4 py-3 text-right font-semibold">Nominal</th>
            <th scope="col" class="px-4 py-3 text-right font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-if="store.isLoading">
            <td colspan="6" class="px-4 py-8 text-center text-slate-700">Memuat data...</td>
          </tr>
          <tr v-else-if="store.cashFlows.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-slate-700">Belum ada catatan arus kas.</td>
          </tr>
          <template v-else>
            <tr v-for="item in store.cashFlows" :key="item.id">
              <td class="px-4 py-3 text-slate-800">{{ formatDateTime(item.created_at) }}</td>
              <td class="px-4 py-3 font-semibold text-slate-900">{{ item.label }}</td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="item.type === 'inflow' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'"
                >
                  {{ item.type === "inflow" ? "Pemasukan" : "Pengeluaran" }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-800">{{ sourceLabels[item.source] }}</td>
              <td class="px-4 py-3 text-right font-semibold text-slate-900">{{ formatRupiah(item.nominal) }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-1">
                  <RouterLink
                    :to="`/cash-flows/${item.id}`"
                    :aria-label="`Lihat detail ${item.label}`"
                    class="rounded-lg p-2 text-slate-800 hover:bg-slate-100"
                  >
                    <Eye :size="18" aria-hidden="true" />
                  </RouterLink>
                  <button
                    type="button"
                    :aria-label="`Ubah ${item.label}`"
                    class="rounded-lg p-2 text-slate-800 hover:bg-slate-100"
                    @click="editing = item"
                  >
                    <Pencil :size="18" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    :aria-label="`Hapus ${item.label}`"
                    class="rounded-lg p-2 text-red-800 hover:bg-red-50"
                    @click="onDelete(item)"
                  >
                    <Trash2 :size="18" aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <AddModal :open="showAdd" :labels="store.labels" @close="showAdd = false" @saved="onSaved" />
    <ChangeModal :open="editing !== null" :cash-flow="editing" :labels="store.labels" @close="editing = null" @saved="onSaved" />
  </section>
</template>
