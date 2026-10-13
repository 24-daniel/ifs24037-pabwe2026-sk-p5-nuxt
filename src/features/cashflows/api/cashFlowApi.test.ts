// @ts-nocheck
import { describe, expect, it, vi } from "vitest";
import * as api from "./cashFlowApi";
import * as apiHelper from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({
  apiGet: vi.fn(() => Promise.resolve({})),
  apiPost: vi.fn(() => Promise.resolve({})),
  apiPut: vi.fn(() => Promise.resolve({})),
  apiDelete: vi.fn(() => Promise.resolve({})),
}));

const payload = { type: "inflow", source: "cash", label: "gaji", description: "Gaji", nominal: 100 };

describe("cashFlowApi", () => {
  it("GET daftar (dengan atau tanpa filter), detail, dan label", async () => {
    await api.getCashFlows({ type: "inflow", label: "gaji" });
    await api.getCashFlows();
    await api.getCashFlow(5);
    await api.getLabels();
    expect(apiHelper.apiGet.mock.calls).toEqual([
      ["/cash-flows", { type: "inflow", label: "gaji" }],
      ["/cash-flows", {}],
      ["/cash-flows/5"],
      ["/cash-flows/labels"],
    ]);
  });

  it("statistik harian dan bulanan", async () => {
    await api.getStatsDaily({ total_data: 7 });
    await api.getStatsDaily();
    await api.getStatsMonthly({ end_date: "2024-10-05 23:59:59" });
    await api.getStatsMonthly();
    expect(apiHelper.apiGet.mock.calls).toEqual([
      ["/cash-flows/stats/daily", { total_data: 7 }],
      ["/cash-flows/stats/daily", {}],
      ["/cash-flows/stats/monthly", { end_date: "2024-10-05 23:59:59" }],
      ["/cash-flows/stats/monthly", {}],
    ]);
  });

  it("tambah dan ubah hanya mengirim field yang diizinkan", async () => {
    await api.addCashFlow({ ...payload, lain: 1 });
    await api.changeCashFlow(5, { ...payload, lain: 1 });
    expect(apiHelper.apiPost).toHaveBeenCalledWith("/cash-flows", payload);
    expect(apiHelper.apiPut).toHaveBeenCalledWith("/cash-flows/5", payload);
  });

  it("hapus satu dan hapus semua", async () => {
    await api.deleteCashFlow(5);
    await api.deleteAllCashFlows();
    expect(apiHelper.apiDelete.mock.calls).toEqual([["/cash-flows/5"], ["/cash-flows"]]);
  });
});
