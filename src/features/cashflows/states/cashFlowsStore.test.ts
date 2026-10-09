import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { emptyPeriodStats, emptyStats, normalizeStats, useCashFlowsStore } from "./cashFlowsStore";
import * as api from "../api/cashFlowApi";
import { fail, inflowItem, ok, rawStats } from "../../../test-utils";

vi.mock("../api/cashFlowApi");

const payload = { type: "inflow", source: "cash", label: "gaji", nominal: 1000, description: "d" } as const;

beforeEach(() => {
  Object.values(api).forEach((fn) => (fn as any).mockReset?.());
  setActivePinia(createPinia());
});

describe("normalizeStats", () => {
  it("menghitung saldo per sumber dana", () => {
    expect(normalizeStats(rawStats)).toEqual({
      cashflow: 975000,
      total_inflow: 1000000,
      total_outflow: 25000,
      cash: 1000000,
      savings: -25000,
      loans: 0,
    });
  });

  it("nilai string numerik dan kosong ditangani", () => {
    expect(
      normalizeStats({ cashflow: "10", total_inflow: "x", total_inflow_loans: "50", total_outflow_loans: "20" })
    ).toEqual({ cashflow: 10, total_inflow: 0, total_outflow: 0, cash: 0, savings: 0, loans: 30 });
  });

  it("emptyStats dan emptyPeriodStats", () => {
    expect(emptyStats().cashflow).toBe(0);
    expect(emptyPeriodStats()).toEqual({ stats_inflow: {}, stats_outflow: {}, stats_cashflow: {} });
  });
});

describe("cashFlowsStore - pengambilan data", () => {
  it("state awal", () => {
    const store = useCashFlowsStore();
    expect(store.cashFlows).toEqual([]);
    expect(store.cashFlow).toBeNull();
    expect(store.labels).toEqual([]);
    expect(store.isCashFlowAdd).toBe(false);
    expect(store.isCashFlowDeletedAll).toBe(false);
  });

  it("fetchCashFlows berhasil dan gagal", async () => {
    const store = useCashFlowsStore();
    vi.mocked(api.getCashFlows).mockResolvedValue(ok({ cash_flows: [inflowItem], stats: rawStats }));
    await store.fetchCashFlows({ type: "inflow" });
    expect(api.getCashFlows).toHaveBeenCalledWith({ type: "inflow" });
    expect(store.cashFlows).toEqual([inflowItem]);
    expect(store.stats.cash).toBe(1000000);
    expect(store.isLoading).toBe(false);

    vi.mocked(api.getCashFlows).mockResolvedValue(fail());
    await store.fetchCashFlows({});
    expect(store.cashFlows).toEqual([]);
    expect(store.stats).toEqual(emptyStats());
  });

  it("fetchCashFlow berhasil dan gagal", async () => {
    const store = useCashFlowsStore();
    vi.mocked(api.getCashFlow).mockResolvedValue(ok({ cash_flow: inflowItem }));
    await store.fetchCashFlow(1);
    expect(store.cashFlow).toEqual(inflowItem);

    vi.mocked(api.getCashFlow).mockResolvedValue(fail());
    await store.fetchCashFlow(1);
    expect(store.cashFlow).toBeNull();
  });

  it("fetchLabels berhasil dan gagal", async () => {
    const store = useCashFlowsStore();
    vi.mocked(api.getLabels).mockResolvedValue(ok({ labels: ["gaji"] }));
    await store.fetchLabels();
    expect(store.labels).toEqual(["gaji"]);

    vi.mocked(api.getLabels).mockResolvedValue(fail());
    await store.fetchLabels();
    expect(store.labels).toEqual([]);
  });

  it("statistik harian dan bulanan", async () => {
    const store = useCashFlowsStore();
    const period = {
      stats_inflow: { "05-10-2024": 1 },
      stats_outflow: { "05-10-2024": 2 },
      stats_cashflow: { "05-10-2024": -1 },
    };
    vi.mocked(api.getDailyStats).mockResolvedValue(ok(period));
    vi.mocked(api.getMonthlyStats).mockResolvedValue(ok(period));
    await store.fetchDailyStats({ total_data: 7 });
    await store.fetchMonthlyStats({ total_data: 6 });
    expect(store.dailyStats).toEqual(period);
    expect(store.monthlyStats).toEqual(period);

    vi.mocked(api.getDailyStats).mockResolvedValue(fail());
    vi.mocked(api.getMonthlyStats).mockResolvedValue(fail());
    await store.fetchDailyStats({});
    await store.fetchMonthlyStats({});
    expect(store.dailyStats).toEqual(emptyPeriodStats());
    expect(store.monthlyStats).toEqual(emptyPeriodStats());
  });
});

describe("cashFlowsStore - mutasi", () => {
  it("addCashFlow melacak status", async () => {
    const store = useCashFlowsStore();
    vi.mocked(api.addCashFlow).mockResolvedValue(ok({ cash_flow_id: 1 }));
    await store.addCashFlow(payload);
    expect(api.addCashFlow).toHaveBeenCalledWith(payload);
    expect(store.isCashFlowAdded).toBe(true);
    expect(store.isCashFlowAdd).toBe(false);

    vi.mocked(api.addCashFlow).mockResolvedValue(fail());
    await store.addCashFlow(payload);
    expect(store.isCashFlowAdded).toBe(false);
  });

  it("changeCashFlow melacak status", async () => {
    const store = useCashFlowsStore();
    vi.mocked(api.updateCashFlow).mockResolvedValue(ok());
    await store.changeCashFlow(1, payload);
    expect(api.updateCashFlow).toHaveBeenCalledWith(1, payload);
    expect(store.isCashFlowChanged).toBe(true);
    expect(store.isCashFlowChange).toBe(false);

    vi.mocked(api.updateCashFlow).mockResolvedValue(fail());
    await store.changeCashFlow(1, payload);
    expect(store.isCashFlowChanged).toBe(false);
  });

  it("removeCashFlow melacak status", async () => {
    const store = useCashFlowsStore();
    vi.mocked(api.deleteCashFlow).mockResolvedValue(ok());
    await store.removeCashFlow(1);
    expect(api.deleteCashFlow).toHaveBeenCalledWith(1);
    expect(store.isCashFlowDeleted).toBe(true);
    expect(store.isCashFlowDelete).toBe(false);

    vi.mocked(api.deleteCashFlow).mockResolvedValue(fail());
    await store.removeCashFlow(1);
    expect(store.isCashFlowDeleted).toBe(false);
  });

  it("removeAllCashFlows melacak status", async () => {
    const store = useCashFlowsStore();
    vi.mocked(api.deleteAllCashFlows).mockResolvedValue(ok());
    await store.removeAllCashFlows();
    expect(store.isCashFlowDeletedAll).toBe(true);
    expect(store.isCashFlowDeleteAll).toBe(false);

    vi.mocked(api.deleteAllCashFlows).mockResolvedValue(fail());
    await store.removeAllCashFlows();
    expect(store.isCashFlowDeletedAll).toBe(false);
  });
});
