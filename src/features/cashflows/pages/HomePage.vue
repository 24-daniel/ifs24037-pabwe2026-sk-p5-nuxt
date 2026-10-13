<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { ArrowDownRight, ArrowUpRight, Eye, Pencil, Plus, Trash2 } from "lucide-vue-next";
import AddModal from "../modals/AddModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import {
  useCashFlowsStore,
  type CashFlow,
  type CashFlowQueryParams,
  type CashFlowTrend,
} from "../states/cashFlowsStore";
import { SOURCES, SOURCE_LABEL, TYPES, TYPE_LABEL } from "../constants";
import { isSuccess } from "../../../helpers/apiHelper";
import {
  cn,
  extractErrorMessage,
  formatDate,
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  toApiDate,
} from "../../../helpers/toolsHelper";

type TrendMode = "daily" | "monthly";

const store = useCashFlowsStore();

const filters = reactive({ type: "", source: "", label: "", startDate: "", endDate: "" });
const showAdd = ref(false);
const editTarget = ref<CashFlow | null>(null);
const trendMode = ref<TrendMode>("daily");

const params = computed<CashFlowQueryParams>(() => {
  const result: CashFlowQueryParams = {};
  if (filters.type) result.type = filters.type as CashFlowQueryParams["type"];
  if (filters.source) result.source = filters.source as CashFlowQueryParams["source"];
  if (filters.label) result.label = filters.label;
  if (filters.startDate) result.start_date = toApiDate(filters.startDate, "start");
  if (filters.endDate) result.end_date = toApiDate(filters.endDate, "end");
  return result;
});
const hasFilter = computed(() => Object.keys(params.value).length > 0);

const metrics = computed(() => {
  const { inflow, outflow, cash, savings, loans } = store.summary;
  return [
    { key: "inflow", label: "Total pemasukan", value: inflow },
    { key: "outflow", label: "Total pengeluaran", value: outflow },
    { key: "cash", label: "Saldo tunai", value: cash },
    { key: "savings", label: "Saldo tabungan", value: savings },
    { key: "loans", label: "Saldo pinjaman", value: loans },
  ];
});

const trend = computed<CashFlowTrend | null>(() =>
  trendMode.value === "daily" ? store.statsDaily : store.statsMonthly,
);
const trendColumns = computed(() => {
  const data = trend.value;
  if (!data) return [];
  const peak = Math.max(1, ...Object.values(data.stats_inflow), ...Object.values(data.stats_outflow));
  return Object.keys(data.stats_inflow).map((key) => {
    const inflow = data.stats_inflow[key] as number;
    const outflow = data.stats_outflow[key] ?? 0;
    return {
      key,
      short: trendMode.value === "daily" ? key.slice(0, 5).replace("-", "/") : key.replace("-", "/"),
      inflow,
      outflow,
      inflowHeight: Math.round((inflow / peak) * 100),
      outflowHeight: Math.round((outflow / peak) * 100),
    };
  });
});

const loadList = () => store.fetchCashFlows(params.value);
const loadTrends = () => Promise.all([store.fetchStatsDaily(), store.fetchStatsMonthly()]);
const refresh = () => Promise.all([loadList(), store.fetchLabels(), loadTrends()]);

onMounted(() => {
  store.fetchLabels();
  loadTrends();
});
watch(params, loadList, { immediate: true });

const resetFilters = () => Object.assign(filters, { type: "", source: "", label: "", startDate: "", endDate: "" });

async function confirmAndRun(message: string, action: () => Promise<{ status: string; message: string }>) {
  if (!(await showConfirmDialog(message))) return;
  const response = await action();
  if (isSuccess(response as never)) {
    await showSuccessDialog(response.message);
    refresh();
  } else {
    showErrorDialog(extractErrorMessage(response as never));
  }
}

const removeCashFlow = (item: CashFlow) =>
  confirmAndRun(`Transaksi "${item.label}" akan dihapus permanen.`, () => store.deleteCashFlow(item.id));

const resetAll = () =>
  confirmAndRun("Seluruh catatan arus kasmu akan dihapus permanen dan tidak bisa dikembalikan.", () =>
    store.deleteAllCashFlows(),
  );
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight">Ringkasan Arus Kas</h1>
        <p class="mt-1 text-sm text-slate-600">Saldo bersih dan semua transaksimu dalam satu tempat.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn btn-danger" @click="resetAll"><Trash2 :size="16" aria-hidden="true" /> Reset semua transaksi</button>
        <button type="button" class="btn btn-primary" @click="showAdd = true"><Plus :size="16" aria-hidden="true" /> Catat transaksi</button>
      </div>
    </div>

    <section class="mt-6" aria-labelledby="summary-heading">
      <h2 id="summary-heading" class="sr-only">Ringkasan saldo</h2>
      <div class="grid gap-4 lg:grid-cols-[1.2fr_2fr]">
        <div class="rounded-xl bg-plum-900 p-6 text-white" data-testid="metric-balance">
          <p class="text-sm font-semibold text-plum-100">Total saldo kas bersih</p>
          <p class="mt-3 text-4xl font-extrabold tracking-tight text-saffron-400">{{ formatRupiah(store.summary.balance) }}</p>
          <p class="mt-3 text-sm text-plum-100">Pemasukan dikurangi pengeluaran dari seluruh sumber dana.</p>
        </div>
        <dl class="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div v-for="metric in metrics" :key="metric.key" class="panel p-4" :data-testid="`metric-${metric.key}`">
            <dt class="text-xs font-semibold text-slate-600">{{ metric.label }}</dt>
            <dd class="mt-2 text-lg font-extrabold" :class="metric.key === 'outflow' ? 'text-loss-700' : metric.key === 'inflow' ? 'text-gain-700' : 'text-slate-900'">
              {{ formatRupiah(metric.value) }}
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="panel mt-6 p-5" aria-labelledby="trend-heading">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 id="trend-heading" class="text-lg font-extrabold">Tren pemasukan dan pengeluaran</h2>
        <div class="flex gap-2" role="group" aria-label="Rentang tren">
          <button type="button" class="btn !py-1.5" :class="trendMode === 'daily' ? 'btn-primary' : 'btn-ghost'" :aria-pressed="trendMode === 'daily'" @click="trendMode = 'daily'">Harian</button>
          <button type="button" class="btn !py-1.5" :class="trendMode === 'monthly' ? 'btn-primary' : 'btn-ghost'" :aria-pressed="trendMode === 'monthly'" @click="trendMode = 'monthly'">Bulanan</button>
        </div>
      </div>
      <p v-if="trendColumns.length === 0" class="mt-4 text-sm text-slate-600">Data tren belum tersedia.</p>
      <template v-else>
        <ul class="mt-5 flex h-40 items-end gap-2 overflow-x-auto" data-testid="trend-chart">
          <li v-for="column in trendColumns" :key="column.key" class="flex h-full min-w-10 flex-1 flex-col justify-end">
            <span class="sr-only">{{ column.key }}: pemasukan {{ formatRupiah(column.inflow) }}, pengeluaran {{ formatRupiah(column.outflow) }}</span>
            <div class="flex flex-1 items-end justify-center gap-1" aria-hidden="true">
              <div class="w-3 rounded-t bg-gain-700" :style="{ height: `${column.inflowHeight}%` }" />
              <div class="w-3 rounded-t bg-loss-700" :style="{ height: `${column.outflowHeight}%` }" />
            </div>
            <span class="mt-2 text-center text-xs text-slate-600" aria-hidden="true">{{ column.short }}</span>
          </li>
        </ul>
        <p class="mt-3 flex gap-4 text-xs text-slate-600">
          <span class="inline-flex items-center gap-1.5"><span class="size-2.5 rounded-sm bg-gain-700" aria-hidden="true" /> Pemasukan</span>
          <span class="inline-flex items-center gap-1.5"><span class="size-2.5 rounded-sm bg-loss-700" aria-hidden="true" /> Pengeluaran</span>
        </p>
      </template>
    </section>

    <section class="mt-6" aria-labelledby="transactions-heading">
      <h2 id="transactions-heading" class="text-lg font-extrabold">Transaksi</h2>

      <div class="panel mt-3 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5" role="group" aria-label="Filter transaksi">
        <div>
          <label class="label" for="filter-type">Jenis</label>
          <select id="filter-type" v-model="filters.type" class="field">
            <option value="">Semua jenis</option>
            <option v-for="item in TYPES" :key="item" :value="item">{{ TYPE_LABEL[item] }}</option>
          </select>
        </div>
        <div>
          <label class="label" for="filter-source">Sumber dana</label>
          <select id="filter-source" v-model="filters.source" class="field">
            <option value="">Semua sumber</option>
            <option v-for="item in SOURCES" :key="item" :value="item">{{ SOURCE_LABEL[item] }}</option>
          </select>
        </div>
        <div>
          <label class="label" for="filter-label">Label</label>
          <select id="filter-label" v-model="filters.label" class="field">
            <option value="">Semua label</option>
            <option v-for="item in store.labels" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>
        <div>
          <label class="label" for="filter-start">Tanggal awal</label>
          <input id="filter-start" v-model="filters.startDate" type="date" class="field" />
        </div>
        <div>
          <label class="label" for="filter-end">Tanggal akhir</label>
          <input id="filter-end" v-model="filters.endDate" type="date" class="field" />
        </div>
        <div v-if="hasFilter" class="sm:col-span-2 lg:col-span-5">
          <button type="button" class="btn btn-ghost" @click="resetFilters">Hapus semua filter</button>
        </div>
      </div>

      <p v-if="store.isCashFlow" class="mt-8 text-center text-sm text-slate-600">Memuat transaksi…</p>
      <p v-else-if="store.cashFlows.length === 0" class="panel mt-4 p-10 text-center text-sm text-slate-600">
        Belum ada transaksi yang cocok. Catat transaksi pertamamu atau ubah filter.
      </p>
      <div v-else class="panel mt-4 overflow-x-auto">
        <table class="w-full min-w-[40rem] text-left text-sm">
          <caption class="sr-only">Daftar transaksi arus kas</caption>
          <thead class="border-b border-slate-200 text-xs text-slate-600">
            <tr>
              <th scope="col" class="px-4 py-3 font-semibold">Tanggal</th>
              <th scope="col" class="px-4 py-3 font-semibold">Label</th>
              <th scope="col" class="px-4 py-3 font-semibold">Sumber</th>
              <th scope="col" class="px-4 py-3 font-semibold">Jenis</th>
              <th scope="col" class="px-4 py-3 text-right font-semibold">Nominal</th>
              <th scope="col" class="px-4 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in store.cashFlows" :key="item.id" data-testid="cashflow-row">
              <td class="px-4 py-3 text-slate-600">{{ formatDate(item.created_at) }}</td>
              <td class="px-4 py-3 font-semibold">{{ item.label }}</td>
              <td class="px-4 py-3">{{ SOURCE_LABEL[item.source] }}</td>
              <td class="px-4 py-3">
                <span :class="cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', item.type === 'inflow' ? 'bg-gain-50 text-gain-700' : 'bg-loss-50 text-loss-700')">
                  <component :is="item.type === 'inflow' ? ArrowDownRight : ArrowUpRight" :size="12" aria-hidden="true" />
                  {{ TYPE_LABEL[item.type] }}
                </span>
              </td>
              <td class="px-4 py-3 text-right font-bold" :class="item.type === 'inflow' ? 'text-gain-700' : 'text-loss-700'">
                {{ item.type === "inflow" ? "+" : "-" }}{{ formatRupiah(item.nominal) }}
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-1.5">
                  <RouterLink :to="`/cash-flows/${item.id}`" class="btn btn-ghost !p-2" :aria-label="`Lihat detail ${item.label}`"><Eye :size="16" aria-hidden="true" /></RouterLink>
                  <button type="button" class="btn btn-ghost !p-2" :aria-label="`Ubah ${item.label}`" @click="editTarget = item"><Pencil :size="16" aria-hidden="true" /></button>
                  <button type="button" class="btn btn-danger !p-2" :aria-label="`Hapus ${item.label}`" @click="removeCashFlow(item)"><Trash2 :size="16" aria-hidden="true" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <AddModal :open="showAdd" @close="showAdd = false" @saved="refresh" />
    <ChangeModal v-if="editTarget" :open="true" :cash-flow="editTarget" @close="editTarget = null" @saved="refresh" />
  </div>
</template>
