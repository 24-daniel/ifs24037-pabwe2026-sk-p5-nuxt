<script setup lang="ts">
import { ref, watch } from "vue";
import { X } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput";
import { useCashFlowsStore, type CashFlowSource, type CashFlowType } from "../states/cashFlowsStore";
import { SOURCES, SOURCE_LABEL, TYPES, TYPE_LABEL } from "../constants";
import { isSuccess } from "../../../helpers/apiHelper";
import {
  extractErrorMessage,
  showErrorDialog,
  showSuccessDialog,
  validateCashFlowForm,
} from "../../../helpers/toolsHelper";

const props = defineProps<{ open?: boolean }>();
const emit = defineEmits<{ (e: "close"): void; (e: "saved"): void }>();

const store = useCashFlowsStore();
const [type, , resetType] = useInput<CashFlowType>("inflow");
const [source, , resetSource] = useInput<CashFlowSource>("cash");
const [label, , resetLabel] = useInput("");
const [nominal, , resetNominal] = useInput("");
const [description, , resetDescription] = useInput("");
const errors = ref<Record<string, string>>({});

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetType();
      resetSource();
      resetLabel();
      resetNominal();
      resetDescription();
      errors.value = {};
    }
  },
);

async function onSubmit() {
  errors.value = validateCashFlowForm({
    label: label.value,
    nominal: nominal.value,
    description: description.value,
  });
  if (Object.keys(errors.value).length > 0) return;

  const response = await store.addCashFlow({
    type: type.value,
    source: source.value,
    label: label.value.trim(),
    nominal: Number(nominal.value),
    description: description.value.trim(),
  });
  if (isSuccess(response)) {
    await showSuccessDialog(response.message, "Transaksi dicatat");
    emit("saved");
    emit("close");
  } else {
    showErrorDialog(extractErrorMessage(response), "Gagal mencatat transaksi");
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-plum-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="add-cashflow-heading">
    <div class="panel my-8 w-full max-w-lg p-6 shadow-xl">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 id="add-cashflow-heading" class="text-xl font-extrabold">Catat transaksi</h2>
          <p class="mt-1 text-sm text-slate-600">Tambahkan pemasukan atau pengeluaran baru.</p>
        </div>
        <button type="button" class="btn btn-ghost !p-2" aria-label="Tutup" @click="emit('close')"><X :size="18" aria-hidden="true" /></button>
      </div>

      <form class="mt-6 space-y-5" novalidate @submit.prevent="onSubmit">
        <fieldset>
          <legend class="label">Jenis arus kas</legend>
          <div class="grid grid-cols-2 gap-3">
            <label v-for="item in TYPES" :key="item" class="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold has-[:checked]:border-plum-800 has-[:checked]:bg-plum-50">
              <input v-model="type" type="radio" name="add-type" :value="item" class="accent-plum-900" />
              {{ TYPE_LABEL[item] }}
            </label>
          </div>
        </fieldset>
        <div>
          <label class="label" for="add-source">Sumber dana</label>
          <select id="add-source" v-model="source" class="field">
            <option v-for="item in SOURCES" :key="item" :value="item">{{ SOURCE_LABEL[item] }}</option>
          </select>
        </div>
        <div>
          <label class="label" for="add-label">Label kategori</label>
          <input id="add-label" v-model="label" type="text" class="field" list="add-label-options" placeholder="Contoh: gaji, makan, transport" />
          <datalist id="add-label-options">
            <option v-for="item in store.labels" :key="item" :value="item" />
          </datalist>
          <p v-if="errors.label" class="field-error">{{ errors.label }}</p>
        </div>
        <div>
          <label class="label" for="add-nominal">Nominal (Rp)</label>
          <input id="add-nominal" v-model="nominal" type="number" min="0" class="field" placeholder="50000" />
          <p v-if="errors.nominal" class="field-error">{{ errors.nominal }}</p>
        </div>
        <div>
          <label class="label" for="add-description">Keterangan</label>
          <textarea id="add-description" v-model="description" rows="3" class="field" placeholder="Catatan singkat transaksi" />
          <p v-if="errors.description" class="field-error">{{ errors.description }}</p>
        </div>
        <div class="flex justify-end gap-3">
          <button type="button" class="btn btn-ghost" @click="emit('close')">Batal</button>
          <button type="submit" class="btn btn-primary" :disabled="store.isCashFlowAdd">
            {{ store.isCashFlowAdd ? "Menyimpan…" : "Simpan transaksi" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
