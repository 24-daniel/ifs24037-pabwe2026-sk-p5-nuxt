<script setup lang="ts">
import { ref, watch } from "vue";
import { X } from "lucide-vue-next";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import type { CashFlow, CashFlowSource, CashFlowType } from "../api/cashFlowApi";
import { useInput } from "../../../hooks/useInput";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const props = defineProps<{ open: boolean; cashFlow: CashFlow | null; labels: string[] }>();
const emit = defineEmits<{ (e: "close"): void; (e: "saved"): void }>();

const store = useCashFlowsStore();
const type = ref<CashFlowType>("inflow");
const source = ref<CashFlowSource>("cash");
const [label, onLabelChange] = useInput("");
const [nominal, onNominalChange] = useInput("");
const [description, onDescriptionChange] = useInput("");

watch(
  () => props.cashFlow,
  (cashFlow) => {
    if (cashFlow) {
      type.value = cashFlow.type;
      source.value = cashFlow.source;
      label.value = cashFlow.label;
      nominal.value = String(cashFlow.nominal);
      description.value = cashFlow.description;
    }
  },
  { immediate: true }
);

async function onSubmit() {
  const response = await store.changeCashFlow(props.cashFlow!.id, {
    type: type.value,
    source: source.value,
    label: label.value,
    nominal: Number(nominal.value),
    description: description.value,
  });
  if (response.success) {
    await showSuccessDialog(response.message);
    emit("saved");
  } else {
    await showErrorDialog(response.message);
  }
}
</script>

<template>
  <div
    v-if="open && cashFlow"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="change-modal-title"
  >
    <div class="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <div class="flex items-start justify-between gap-4">
        <h2 id="change-modal-title" class="text-xl font-bold text-slate-900">Ubah Arus Kas</h2>
        <button
          type="button"
          aria-label="Tutup"
          class="rounded-lg p-1.5 text-slate-800 hover:bg-slate-100 focus:outline-2 focus:outline-indigo-700"
          @click="emit('close')"
        >
          <X :size="20" aria-hidden="true" />
        </button>
      </div>

      <form class="mt-4 space-y-4" @submit.prevent="onSubmit">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="change-type" class="mb-1 block text-sm font-semibold text-slate-800">Jenis</label>
            <select id="change-type" v-model="type" class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900">
              <option value="inflow">Pemasukan (Inflow)</option>
              <option value="outflow">Pengeluaran (Outflow)</option>
            </select>
          </div>
          <div>
            <label for="change-source" class="mb-1 block text-sm font-semibold text-slate-800">Sumber dana</label>
            <select id="change-source" v-model="source" class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900">
              <option value="cash">Tunai</option>
              <option value="savings">Tabungan</option>
              <option value="loans">Pinjaman</option>
            </select>
          </div>
        </div>
        <div>
          <label for="change-label" class="mb-1 block text-sm font-semibold text-slate-800">Label kategori</label>
          <input
            id="change-label"
            type="text"
            required
            list="change-label-options"
            class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900"
            :value="label"
            @input="onLabelChange"
          />
          <datalist id="change-label-options">
            <option v-for="item in labels" :key="item" :value="item"></option>
          </datalist>
        </div>
        <div>
          <label for="change-nominal" class="mb-1 block text-sm font-semibold text-slate-800">Nominal (Rp)</label>
          <input
            id="change-nominal"
            type="number"
            min="1"
            required
            class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900"
            :value="nominal"
            @input="onNominalChange"
          />
        </div>
        <div>
          <label for="change-description" class="mb-1 block text-sm font-semibold text-slate-800">Keterangan</label>
          <textarea
            id="change-description"
            rows="3"
            required
            class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900"
            :value="description"
            @input="onDescriptionChange"
          ></textarea>
        </div>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-800 hover:bg-slate-100"
            @click="emit('close')"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="store.isCashFlowChange"
            class="rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-800 disabled:opacity-60"
          >
            {{ store.isCashFlowChange ? "Menyimpan..." : "Simpan Perubahan" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
