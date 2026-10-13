import type { CashFlowSource, CashFlowType } from "./states/cashFlowsStore";

export const TYPE_LABEL: Record<CashFlowType, string> = {
  inflow: "Pemasukan",
  outflow: "Pengeluaran",
};

export const SOURCE_LABEL: Record<CashFlowSource, string> = {
  cash: "Tunai",
  savings: "Tabungan",
  loans: "Pinjaman",
};

export const TYPES = Object.keys(TYPE_LABEL) as CashFlowType[];
export const SOURCES = Object.keys(SOURCE_LABEL) as CashFlowSource[];
