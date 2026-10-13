import { defineStore } from "pinia";
import * as cashFlowApi from "../api/cashFlowApi";
import { isSuccess, type ApiResponse } from "../../../helpers/apiHelper";

export type CashFlowType = "inflow" | "outflow";
export type CashFlowSource = "cash" | "savings" | "loans";

export interface CashFlow {
  id: number;
  user_id: number;
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  description: string;
  nominal: number;
  created_at: string;
  updated_at: string;
}

export interface CashFlowPayload {
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  description: string;
  nominal: number;
}

/** Ringkasan dari API, mis. total_inflow_cash, total_outflow_savings, dst. */
export interface CashFlowStats {
  cashflow: number;
  total_inflow: number;
  total_outflow: number;
  [key: string]: number;
}

export interface CashFlowQueryParams {
  type?: CashFlowType | "";
  source?: CashFlowSource | "";
  label?: string;
  start_date?: string;
  end_date?: string;
}

export interface TrendQueryParams {
  end_date?: string;
  total_data?: number;
}

/** Statistik harian/bulanan: kunci tanggal ("05-10-2024") atau bulan ("10-2024"). */
export interface CashFlowTrend {
  stats_inflow: Record<string, number>;
  stats_outflow: Record<string, number>;
  stats_cashflow: Record<string, number>;
}

export interface CashFlowSummary {
  balance: number;
  inflow: number;
  outflow: number;
  cash: number;
  savings: number;
  loans: number;
}

export interface CashFlowsState {
  cashFlows: CashFlow[];
  cashFlow: CashFlow | null;
  stats: CashFlowStats;
  labels: string[];
  statsDaily: CashFlowTrend | null;
  statsMonthly: CashFlowTrend | null;
  isCashFlow: boolean;
  isCashFlowAdd: boolean;
  isCashFlowAdded: boolean;
  isCashFlowChange: boolean;
  isCashFlowChanged: boolean;
  isCashFlowDelete: boolean;
  isCashFlowDeleted: boolean;
  isCashFlowDeleteAll: boolean;
  isCashFlowDeletedAll: boolean;
}

type Flags = {
  [K in keyof CashFlowsState as CashFlowsState[K] extends boolean ? K : never]: boolean;
};

const emptyStats = (): CashFlowStats => ({ cashflow: 0, total_inflow: 0, total_outflow: 0 });

export const useCashFlowsStore = defineStore("cashFlows", {
  state: (): CashFlowsState => ({
    cashFlows: [],
    cashFlow: null,
    stats: emptyStats(),
    labels: [],
    statsDaily: null,
    statsMonthly: null,
    isCashFlow: false,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false,
  }),
  getters: {
    /** Saldo per sumber dana = total pemasukan - total pengeluaran sumber tersebut. */
    summary: (state): CashFlowSummary => {
      const net = (source: CashFlowSource) =>
        (state.stats[`total_inflow_${source}`] ?? 0) - (state.stats[`total_outflow_${source}`] ?? 0);
      return {
        balance: state.stats.cashflow ?? 0,
        inflow: state.stats.total_inflow ?? 0,
        outflow: state.stats.total_outflow ?? 0,
        cash: net("cash"),
        savings: net("savings"),
        loans: net("loans"),
      };
    },
  },
  actions: {
    async fetchCashFlows(params?: CashFlowQueryParams) {
      this.isCashFlow = true;
      const response = await cashFlowApi.getCashFlows(params);
      const ok = isSuccess(response);
      this.cashFlows = ok ? response.data!.cash_flows : [];
      this.stats = ok ? response.data!.stats : emptyStats();
      this.isCashFlow = false;
      return response;
    },
    async fetchCashFlow(id: number | string) {
      this.isCashFlow = true;
      const response = await cashFlowApi.getCashFlow(id);
      this.cashFlow = isSuccess(response) ? response.data!.cash_flow : null;
      this.isCashFlow = false;
      return response;
    },
    async fetchLabels() {
      const response = await cashFlowApi.getLabels();
      this.labels = isSuccess(response) ? response.data!.labels : [];
      return response;
    },
    async fetchStatsDaily(params?: TrendQueryParams) {
      const response = await cashFlowApi.getStatsDaily(params);
      this.statsDaily = isSuccess(response) ? response.data! : null;
      return response;
    },
    async fetchStatsMonthly(params?: TrendQueryParams) {
      const response = await cashFlowApi.getStatsMonthly(params);
      this.statsMonthly = isSuccess(response) ? response.data! : null;
      return response;
    },
    // Menyalakan flag "sedang berjalan" lalu flag "berhasil" untuk aksi mutasi.
    async track(loading: keyof Flags, done: keyof Flags, call: () => Promise<ApiResponse>) {
      this[loading] = true;
      this[done] = false;
      const response = await call();
      this[loading] = false;
      this[done] = isSuccess(response);
      return response;
    },
    addCashFlow(payload: CashFlowPayload) {
      return this.track("isCashFlowAdd", "isCashFlowAdded", () => cashFlowApi.addCashFlow(payload));
    },
    changeCashFlow(id: number | string, payload: CashFlowPayload) {
      return this.track("isCashFlowChange", "isCashFlowChanged", () =>
        cashFlowApi.changeCashFlow(id, payload),
      );
    },
    deleteCashFlow(id: number | string) {
      return this.track("isCashFlowDelete", "isCashFlowDeleted", () => cashFlowApi.deleteCashFlow(id));
    },
    deleteAllCashFlows() {
      return this.track("isCashFlowDeleteAll", "isCashFlowDeletedAll", () =>
        cashFlowApi.deleteAllCashFlows(),
      );
    },
  },
});
