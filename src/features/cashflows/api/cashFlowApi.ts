import { apiDelete, apiGet, apiPost, apiPut } from "../../../helpers/apiHelper";
import type {
  CashFlow,
  CashFlowPayload,
  CashFlowQueryParams,
  CashFlowStats,
  CashFlowTrend,
  TrendQueryParams,
} from "../states/cashFlowsStore";

export const getCashFlows = (params?: CashFlowQueryParams) =>
  apiGet<{ cash_flows: CashFlow[]; stats: CashFlowStats }>("/cash-flows", { ...params });

export const getCashFlow = (id: number | string) =>
  apiGet<{ cash_flow: CashFlow }>(`/cash-flows/${id}`);

export const addCashFlow = ({ type, source, label, description, nominal }: CashFlowPayload) =>
  apiPost<{ cash_flow_id: number }>("/cash-flows", { type, source, label, description, nominal });

export const changeCashFlow = (
  id: number | string,
  { type, source, label, description, nominal }: CashFlowPayload,
) => apiPut(`/cash-flows/${id}`, { type, source, label, description, nominal });

export const deleteCashFlow = (id: number | string) => apiDelete(`/cash-flows/${id}`);

export const getLabels = () => apiGet<{ labels: string[] }>("/cash-flows/labels");

export const getStatsDaily = (params?: TrendQueryParams) =>
  apiGet<CashFlowTrend>("/cash-flows/stats/daily", { ...params });

export const getStatsMonthly = (params?: TrendQueryParams) =>
  apiGet<CashFlowTrend>("/cash-flows/stats/monthly", { ...params });

export const deleteAllCashFlows = () => apiDelete("/cash-flows");
