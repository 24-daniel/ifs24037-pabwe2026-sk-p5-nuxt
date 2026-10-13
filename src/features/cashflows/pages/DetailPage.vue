<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-vue-next";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { SOURCE_LABEL, TYPE_LABEL } from "../constants";
import { isSuccess } from "../../../helpers/apiHelper";
import {
  cn,
  extractErrorMessage,
  formatDate,
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const route = useRoute();
const router = useRouter();
const store = useCashFlowsStore();
const showChange = ref(false);

const cashFlow = computed(() => store.cashFlow);

function load() {
  store.cashFlow = null;
  return store.fetchCashFlow(route.params.cashFlowId as string);
}
watch(() => route.params.cashFlowId, load, { immediate: true });

async function removeCashFlow() {
  if (!(await showConfirmDialog("Transaksi ini akan dihapus permanen."))) return;
  const response = await store.deleteCashFlow(cashFlow.value!.id);
  if (isSuccess(response)) {
    await showSuccessDialog(response.message);
    router.push("/");
  } else {
    showErrorDialog(extractErrorMessage(response));
  }
}
</script>

<template>
  <div>
    <RouterLink to="/" class="inline-flex items-center gap-2 text-sm font-semibold text-plum-900 hover:underline">
      <ArrowLeft :size="16" aria-hidden="true" /> Kembali ke ringkasan
    </RouterLink>

    <div v-if="store.isCashFlow" class="mt-10 text-center">
      <!-- h1 tetap ada saat loading agar halaman selalu punya heading level-satu (Axe: page-has-heading-one) -->
      <h1 class="sr-only">Detail transaksi</h1>
      <p class="text-sm text-slate-600">Memuat detail transaksi…</p>
    </div>
    <div v-else-if="!cashFlow" class="panel mt-8 p-10 text-center">
      <h1 class="font-bold">Transaksi tidak ditemukan</h1>
      <p class="mt-1 text-sm text-slate-600">Transaksi mungkin sudah dihapus.</p>
    </div>

    <article v-else class="panel mt-6 max-w-2xl p-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span :class="cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', cashFlow.type === 'inflow' ? 'bg-gain-50 text-gain-700' : 'bg-loss-50 text-loss-700')">
            {{ TYPE_LABEL[cashFlow.type] }}
          </span>
          <h1 class="mt-3 text-3xl font-extrabold tracking-tight">{{ cashFlow.label }}</h1>
        </div>
        <p class="text-3xl font-extrabold" :class="cashFlow.type === 'inflow' ? 'text-gain-700' : 'text-loss-700'">
          {{ cashFlow.type === "inflow" ? "+" : "-" }}{{ formatRupiah(cashFlow.nominal) }}
        </p>
      </div>

      <dl class="mt-8 grid gap-5 sm:grid-cols-2">
        <div>
          <dt class="text-xs font-semibold text-slate-600">Sumber dana</dt>
          <dd class="mt-1 font-bold">{{ SOURCE_LABEL[cashFlow.source] }}</dd>
        </div>
        <div>
          <dt class="text-xs font-semibold text-slate-600">Label</dt>
          <dd class="mt-1 font-bold">{{ cashFlow.label }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-xs font-semibold text-slate-600">Keterangan</dt>
          <dd class="mt-1 whitespace-pre-line">{{ cashFlow.description }}</dd>
        </div>
        <div>
          <dt class="text-xs font-semibold text-slate-600">Dibuat</dt>
          <dd class="mt-1">{{ formatDate(cashFlow.created_at) }}</dd>
        </div>
        <div>
          <dt class="text-xs font-semibold text-slate-600">Diperbarui</dt>
          <dd class="mt-1">{{ formatDate(cashFlow.updated_at) }}</dd>
        </div>
      </dl>

      <div class="mt-8 flex flex-wrap gap-2">
        <button type="button" class="btn btn-ghost" @click="showChange = true"><Pencil :size="16" aria-hidden="true" /> Ubah</button>
        <button type="button" class="btn btn-danger" @click="removeCashFlow"><Trash2 :size="16" aria-hidden="true" /> Hapus</button>
      </div>

      <ChangeModal :open="showChange" :cash-flow="cashFlow" @close="showChange = false" @saved="load" />
    </article>
  </div>
</template>
