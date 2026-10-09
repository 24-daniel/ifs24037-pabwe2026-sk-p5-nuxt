<script setup lang="ts">
import { ref } from "vue";
import { X } from "lucide-vue-next";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import type { CashFlowSource, CashFlowType } from "../api/cashFlowApi";
import { useInput } from "../../../hooks/useInput";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

defineProps<{ open: boolean; labels: string[] }>();
const emit = defineEmits<{ (e: "close"): void; (e: "saved"): void }>();

const store = useCashFlowsStore();
const type = ref<CashFlowType>("inflow");
const source = ref<CashFlowSource>("cash");
const [label, onLabelChange, resetLabel] = useInput("");
const [nominal, onNominalChange, resetNominal] = useInput("");
const [description, onDescriptionChange, resetDescription] = useInput("");

function resetForm() {
  type.value = "inflow";
  source.value = "cash";
  resetLabel();
  resetNominal();
  resetDescription();
}

async function onSubmit() {
  const response = await store.addCashFlow({
    type: type.value,
    source: source.value,
    label: label.value,
    nominal: Number(nominal.value),
    description: description.value,
  });
  if (response.success) {
    await showSuccessDialog(response.message);
    resetForm();
    emit("saved");
  } else {
    await showErrorDialog(response.message);
  }
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="add-modal-title"
  >
    <div class="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <div class="flex items-start justify-between gap-4">
        <h2 id="add-modal-title" class="text-xl font-bold text-slate-900">Tambah Arus Kas</h2>
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
            <label for="add-type" class="mb-1 block text-sm font-semibold text-slate-800">Jenis</label>
            <select id="add-type" v-model="type" class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900">
              <option value="inflow">Pemasukan (Inflow)</option>
              <option value="outflow">Pengeluaran (Outflow)</option>
            </select>
          </div>
          <div>
            <label for="add-source" class="mb-1 block text-sm font-semibold text-slate-800">Sumber dana</label>
            <select id="add-source" v-model="source" class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900">
              <option value="cash">Tunai</option>
              <option value="savings">Tabungan</option>
              <option value="loans">Pinjaman</option>
            </select>
          </div>
        </div>
        <div>
          <label for="add-label" class="mb-1 block text-sm font-semibold text-slate-800">Label kategori</label>
          <input
            id="add-label"
            type="text"
            required
            list="add-label-options"
            placeholder="Contoh: gaji, makan, transport"
            class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900"
            :value="label"
            @input="onLabelChange"
          />
          <datalist id="add-label-options">
            <option v-for="item in labels" :key="item" :value="item"></option>
          </datalist>
        </div>
        <div>
          <label for="add-nominal" class="mb-1 block text-sm font-semibold text-slate-800">Nominal (Rp)</label>
          <input
            id="add-nominal"
            type="number"
            min="1"
            required
            placeholder="0"
            class="w-full rounded-lg border border-slate-400 px-3 py-2 text-slate-900"
            :value="nominal"
            @input="onNominalChange"
          />
        </div>
        <div>
          <label for="add-description" class="mb-1 block text-sm font-semibold text-slate-800">Keterangan</label>
          <textarea
            id="add-description"
            rows="3"
            required
            placeholder="Tulis keterangan transaksi"
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
            :disabled="store.isCashFlowAdd"
            class="rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-800 disabled:opacity-60"
          >
            {{ store.isCashFlowAdd ? "Menyimpan..." : "Simpan" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
