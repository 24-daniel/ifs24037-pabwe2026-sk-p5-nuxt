import { defineStore } from "pinia";
import {
  addCashFlow,
  deleteAllCashFlows,
  deleteCashFlow,
  getCashFlow,
  getCashFlows,
  getDailyStats,
  getLabels,
  getMonthlyStats,
  updateCashFlow,
  type CashFlow,
  type CashFlowPayload,
  type CashFlowQueryParams,
  type StatsQueryParams,
} from "../api/cashFlowApi";

export type { CashFlow, CashFlowQueryParams };

export interface CashFlowStats {
  cashflow: number;
  total_inflow: number;
  total_outflow: number;
  cash: number;
  savings: number;
  loans: number;
}

export type StatsSeries = Record<string, number>;

export interface PeriodStats {
  stats_inflow: StatsSeries;
  stats_outflow: StatsSeries;
  stats_cashflow: StatsSeries;
}

export interface CashFlowsState {
  cashFlows: CashFlow[];
  cashFlow: CashFlow | null;
  stats: CashFlowStats;
  labels: string[];
  dailyStats: PeriodStats;
  monthlyStats: PeriodStats;
  isLoading: boolean;
  isCashFlowAdd: boolean;
  isCashFlowAdded: boolean;
  isCashFlowChange: boolean;
  isCashFlowChanged: boolean;
  isCashFlowDelete: boolean;
  isCashFlowDeleted: boolean;
  isCashFlowDeleteAll: boolean;
  isCashFlowDeletedAll: boolean;
}

const toNumber = (value: unknown): number => Number(value) || 0;

export const emptyStats = (): CashFlowStats => ({
  cashflow: 0,
  total_inflow: 0,
  total_outflow: 0,
  cash: 0,
  savings: 0,
  loans: 0,
});

export const emptyPeriodStats = (): PeriodStats => ({
  stats_inflow: {},
  stats_outflow: {},
  stats_cashflow: {},
});

/** Mengubah statistik mentah API menjadi ringkasan saldo per sumber dana. */
export function normalizeStats(raw: Record<string, unknown>): CashFlowStats {
  return {
    cashflow: toNumber(raw.cashflow),
    total_inflow: toNumber(raw.total_inflow),
    total_outflow: toNumber(raw.total_outflow),
    cash: toNumber(raw.total_inflow_cash) - toNumber(raw.total_outflow_cash),
    savings: toNumber(raw.total_inflow_savings) - toNumber(raw.total_outflow_savings),
    loans: toNumber(raw.total_inflow_loans) - toNumber(raw.total_outflow_loans),
  };
}

export const useCashFlowsStore = defineStore("cashFlows", {
  state: (): CashFlowsState => ({
    cashFlows: [],
    cashFlow: null,
    stats: emptyStats(),
    labels: [],
    dailyStats: emptyPeriodStats(),
    monthlyStats: emptyPeriodStats(),
    isLoading: false,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false,
  }),
  actions: {
    async fetchCashFlows(params: CashFlowQueryParams) {
      this.isLoading = true;
      const response = await getCashFlows(params);
      this.cashFlows = response.success ? response.data.cash_flows : [];
      this.stats = response.success ? normalizeStats(response.data.stats) : emptyStats();
      this.isLoading = false;
      return response;
    },
    async fetchCashFlow(id: string | number) {
      this.isLoading = true;
      const response = await getCashFlow(id);
      this.cashFlow = response.success ? response.data.cash_flow : null;
      this.isLoading = false;
      return response;
    },
    async fetchLabels() {
      const response = await getLabels();
      this.labels = response.success ? response.data.labels : [];
      return response;
    },
    async fetchDailyStats(params: StatsQueryParams) {
      const response = await getDailyStats(params);
      this.dailyStats = response.success ? response.data : emptyPeriodStats();
      return response;
    },
    async fetchMonthlyStats(params: StatsQueryParams) {
      const response = await getMonthlyStats(params);
      this.monthlyStats = response.success ? response.data : emptyPeriodStats();
      return response;
    },
    async addCashFlow(payload: CashFlowPayload) {
      this.isCashFlowAdd = true;
      this.isCashFlowAdded = false;
      const response = await addCashFlow(payload);
      this.isCashFlowAdded = response.success;
      this.isCashFlowAdd = false;
      return response;
    },
    async changeCashFlow(id: string | number, payload: CashFlowPayload) {
      this.isCashFlowChange = true;
      this.isCashFlowChanged = false;
      const response = await updateCashFlow(id, payload);
      this.isCashFlowChanged = response.success;
      this.isCashFlowChange = false;
      return response;
    },
    async removeCashFlow(id: string | number) {
      this.isCashFlowDelete = true;
      this.isCashFlowDeleted = false;
      const response = await deleteCashFlow(id);
      this.isCashFlowDeleted = response.success;
      this.isCashFlowDelete = false;
      return response;
    },
    async removeAllCashFlows() {
      this.isCashFlowDeleteAll = true;
      this.isCashFlowDeletedAll = false;
      const response = await deleteAllCashFlows();
      this.isCashFlowDeletedAll = response.success;
      this.isCashFlowDeleteAll = false;
      return response;
    },
  },
});
