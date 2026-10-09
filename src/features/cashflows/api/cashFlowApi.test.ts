import { beforeEach, describe, expect, it, vi } from "vitest";
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
} from "./cashFlowApi";
import { apiRequest } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ apiRequest: vi.fn() }));

const payload = { type: "inflow", source: "cash", label: "gaji", nominal: 1000, description: "d" } as const;

beforeEach(() => {
  vi.mocked(apiRequest).mockReset();
  vi.mocked(apiRequest).mockResolvedValue({ success: true, message: "ok", data: null });
});

describe("cashFlowApi", () => {
  it("getCashFlows meneruskan filter sebagai query", async () => {
    await getCashFlows({ type: "inflow", source: "cash", label: "gaji", start_date: "a", end_date: "b" });
    expect(apiRequest).toHaveBeenCalledWith("/cash-flows", {
      query: { type: "inflow", source: "cash", label: "gaji", start_date: "a", end_date: "b" },
    });
  });

  it("getCashFlow memakai id", async () => {
    await getCashFlow(7);
    expect(apiRequest).toHaveBeenCalledWith("/cash-flows/7");
  });

  it("addCashFlow memakai POST", async () => {
    await addCashFlow(payload);
    expect(apiRequest).toHaveBeenCalledWith("/cash-flows", { method: "POST", body: payload });
  });

  it("updateCashFlow memakai PUT", async () => {
    await updateCashFlow("7", payload);
    expect(apiRequest).toHaveBeenCalledWith("/cash-flows/7", { method: "PUT", body: payload });
  });

  it("deleteCashFlow memakai DELETE", async () => {
    await deleteCashFlow(7);
    expect(apiRequest).toHaveBeenCalledWith("/cash-flows/7", { method: "DELETE" });
  });

  it("getLabels", async () => {
    await getLabels();
    expect(apiRequest).toHaveBeenCalledWith("/cash-flows/labels");
  });

  it("statistik harian dan bulanan", async () => {
    await getDailyStats({ end_date: "2024-10-05", total_data: 7 });
    await getMonthlyStats({ total_data: 6 });
    expect(apiRequest).toHaveBeenNthCalledWith(1, "/cash-flows/stats/daily", {
      query: { end_date: "2024-10-05", total_data: 7 },
    });
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/cash-flows/stats/monthly", {
      query: { total_data: 6 },
    });
  });

  it("deleteAllCashFlows memakai DELETE /cash-flows", async () => {
    await deleteAllCashFlows();
    expect(apiRequest).toHaveBeenCalledWith("/cash-flows", { method: "DELETE" });
  });
});
