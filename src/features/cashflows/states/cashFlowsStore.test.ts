// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockPinia, makeCashFlow } from "../../../test-utils";
import { useCashFlowsStore } from "./cashFlowsStore";
import * as api from "../api/cashFlowApi";

vi.mock("../api/cashFlowApi");

const ok = (data) => ({ status: "success", message: "ok", data });
const fail = { status: "fail", message: "gagal" };

describe("cashFlowsStore", () => {
  beforeEach(() => createMockPinia());

  it("state awal kosong dengan ringkasan nol", () => {
    const store = useCashFlowsStore();
    expect(store.cashFlows).toEqual([]);
    expect(store.summary).toEqual({ balance: 0, inflow: 0, outflow: 0, cash: 0, savings: 0, loans: 0 });
  });

  it("fetchCashFlows memuat daftar dan statistik, lalu menghitung saldo per sumber", async () => {
    const store = useCashFlowsStore();
    const stats = {
      cashflow: 2000000,
      total_inflow: 2500000,
      total_outflow: 500000,
      total_inflow_cash: 2500000,
      total_outflow_cash: 100000,
      total_outflow_savings: 400000,
      total_inflow_loans: 50000,
    };
    api.getCashFlows.mockResolvedValue(ok({ cash_flows: [makeCashFlow()], stats }));
    const pending = store.fetchCashFlows({ type: "outflow" });
    expect(store.isCashFlow).toBe(true);
    await pending;
    expect(api.getCashFlows).toHaveBeenCalledWith({ type: "outflow" });
    expect(store.isCashFlow).toBe(false);
    expect(store.cashFlows).toHaveLength(1);
    expect(store.summary).toEqual({
      balance: 2000000,
      inflow: 2500000,
      outflow: 500000,
      cash: 2400000,
      savings: -400000,
      loans: 50000,
    });
  });

  it("fetchCashFlows gagal mengosongkan data; statistik kosong dari server tetap aman", async () => {
    const store = useCashFlowsStore();
    api.getCashFlows.mockResolvedValue(ok({ cash_flows: [makeCashFlow()], stats: [] }));
    await store.fetchCashFlows();
    expect(store.summary.balance).toBe(0);
    expect(store.summary.cash).toBe(0);
    api.getCashFlows.mockResolvedValue(fail);
    await store.fetchCashFlows();
    expect(store.cashFlows).toEqual([]);
    expect(store.stats).toEqual({ cashflow: 0, total_inflow: 0, total_outflow: 0 });
  });

  it("fetchCashFlow sukses dan gagal", async () => {
    const store = useCashFlowsStore();
    api.getCashFlow.mockResolvedValue(ok({ cash_flow: makeCashFlow({ id: 3 }) }));
    await store.fetchCashFlow(3);
    expect(store.cashFlow.id).toBe(3);
    api.getCashFlow.mockResolvedValue(fail);
    await store.fetchCashFlow(4);
    expect(store.cashFlow).toBeNull();
  });

  it("fetchLabels", async () => {
    const store = useCashFlowsStore();
    api.getLabels.mockResolvedValue(ok({ labels: ["gaji"] }));
    await store.fetchLabels();
    expect(store.labels).toEqual(["gaji"]);
    api.getLabels.mockResolvedValue(fail);
    await store.fetchLabels();
    expect(store.labels).toEqual([]);
  });

  it("fetchStatsDaily dan fetchStatsMonthly", async () => {
    const store = useCashFlowsStore();
    const trend = { stats_inflow: { "05-10-2024": 1 }, stats_outflow: {}, stats_cashflow: {} };
    api.getStatsDaily.mockResolvedValue(ok(trend));
    api.getStatsMonthly.mockResolvedValue(ok(trend));
    await store.fetchStatsDaily({ total_data: 7 });
    await store.fetchStatsMonthly();
    expect(api.getStatsDaily).toHaveBeenCalledWith({ total_data: 7 });
    expect(store.statsDaily).toEqual(trend);
    expect(store.statsMonthly).toEqual(trend);
    api.getStatsDaily.mockResolvedValue(fail);
    api.getStatsMonthly.mockResolvedValue(fail);
    await store.fetchStatsDaily();
    await store.fetchStatsMonthly();
    expect(store.statsDaily).toBeNull();
    expect(store.statsMonthly).toBeNull();
  });

  const payload = { type: "inflow", source: "cash", label: "gaji", description: "Gaji", nominal: 1 };
  const cases = [
    ["addCashFlow", "addCashFlow", "isCashFlowAdd", "isCashFlowAdded", [payload]],
    ["changeCashFlow", "changeCashFlow", "isCashFlowChange", "isCashFlowChanged", [1, payload]],
    ["deleteCashFlow", "deleteCashFlow", "isCashFlowDelete", "isCashFlowDeleted", [1]],
    ["deleteAllCashFlows", "deleteAllCashFlows", "isCashFlowDeleteAll", "isCashFlowDeletedAll", []],
  ];

  it.each(cases)("%s melacak status mutasi", async (action, apiName, loadingKey, doneKey, args) => {
    const store = useCashFlowsStore();
    api[apiName].mockResolvedValue({ status: "success", message: "ok" });
    const pending = store[action](...args);
    expect(store[loadingKey]).toBe(true);
    expect(store[doneKey]).toBe(false);
    const response = await pending;
    expect(response.message).toBe("ok");
    expect(api[apiName]).toHaveBeenCalledWith(...args);
    expect(store[loadingKey]).toBe(false);
    expect(store[doneKey]).toBe(true);

    api[apiName].mockResolvedValue({ status: "fail" });
    await store[action](...args);
    expect(store[doneKey]).toBe(false);
  });
});
