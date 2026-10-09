import { apiRequest } from "../../../helpers/apiHelper";

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
  nominal: number;
  description: string;
}

export interface CashFlowQueryParams {
  type?: string;
  source?: string;
  label?: string;
  start_date?: string;
  end_date?: string;
}

export interface StatsQueryParams {
  end_date?: string;
  total_data?: number;
}

export function getCashFlows(params: CashFlowQueryParams) {
  return apiRequest("/cash-flows", { query: { ...params } });
}

export function getCashFlow(id: string | number) {
  return apiRequest(`/cash-flows/${id}`);
}

export function addCashFlow(payload: CashFlowPayload) {
  return apiRequest("/cash-flows", { method: "POST", body: payload });
}

export function updateCashFlow(id: string | number, payload: CashFlowPayload) {
  return apiRequest(`/cash-flows/${id}`, { method: "PUT", body: payload });
}

export function deleteCashFlow(id: string | number) {
  return apiRequest(`/cash-flows/${id}`, { method: "DELETE" });
}

export function getLabels() {
  return apiRequest("/cash-flows/labels");
}

export function getDailyStats(params: StatsQueryParams) {
  return apiRequest("/cash-flows/stats/daily", { query: { ...params } });
}

export function getMonthlyStats(params: StatsQueryParams) {
  return apiRequest("/cash-flows/stats/monthly", { query: { ...params } });
}

export function deleteAllCashFlows() {
  return apiRequest("/cash-flows", { method: "DELETE" });
}
