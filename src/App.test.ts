// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/vue";
import { createPinia } from "pinia";
import { createMemoryHistory } from "vue-router";
import App from "./App.vue";
import { createAppRouter } from "./router";
import * as authApi from "./features/auth/api/authApi";
import * as userApi from "./features/users/api/userApi";
import * as cashFlowApi from "./features/cashflows/api/cashFlowApi";
import { getAccessToken } from "./helpers/apiHelper";
import { makeCashFlow } from "./test-utils";

vi.mock("./features/auth/api/authApi");
vi.mock("./features/users/api/userApi");
vi.mock("./features/cashflows/api/cashFlowApi");

const ok = (data) => ({ status: "success", message: "ok", data });

const mountApp = async (path) => {
  const router = createAppRouter(createMemoryHistory());
  router.push(path);
  await router.isReady();
  render(App, { global: { plugins: [createPinia(), router] } });
  return router;
};

describe("App (integrasi)", () => {
  beforeEach(() => {
    authApi.login.mockResolvedValue(ok({ token: "TOK" }));
    authApi.logout.mockResolvedValue({ status: "success" });
    userApi.getProfile.mockResolvedValue(ok({ user: { id: 1, name: "Abdullah Ubaid", email: "a@b.co", photo: "" } }));
    userApi.getUsers.mockResolvedValue(ok({ users: [] }));
    cashFlowApi.getCashFlows.mockResolvedValue(
      ok({ cash_flows: [makeCashFlow({ label: "gaji", type: "inflow" })], stats: { cashflow: 1, total_inflow: 1, total_outflow: 0 } }),
    );
    cashFlowApi.getLabels.mockResolvedValue(ok({ labels: [] }));
    cashFlowApi.getStatsDaily.mockResolvedValue(ok({ stats_inflow: {}, stats_outflow: {}, stats_cashflow: {} }));
    cashFlowApi.getStatsMonthly.mockResolvedValue(ok({ stats_inflow: {}, stats_outflow: {}, stats_cashflow: {} }));
  });

  it("alur lengkap: login -> dashboard -> pengguna -> logout", async () => {
    const router = await mountApp("/");
    expect(await screen.findByText("Masuk ke akunmu")).toBeInTheDocument();

    await fireEvent.update(screen.getByLabelText("Email"), "a@b.co");
    await fireEvent.update(screen.getByLabelText("Kata sandi"), "rahasia");
    await fireEvent.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByRole("heading", { name: "Ringkasan Arus Kas" })).toBeInTheDocument();
    expect(await screen.findByText("gaji")).toBeInTheDocument();
    expect(getAccessToken()).toBe("TOK");

    await fireEvent.click(screen.getByRole("link", { name: "Direktori Pengguna" }));
    expect(await screen.findByText("Belum ada pengguna terdaftar.")).toBeInTheDocument();

    await fireEvent.click(screen.getByRole("button", { name: /keluar/i }));
    await waitFor(() => expect(router.currentRoute.value.path).toBe("/auth/login"));
    expect(getAccessToken()).toBeNull();
  });

  it("rute tidak dikenal menampilkan halaman 404", async () => {
    await mountApp("/tidak-ada");
    expect(await screen.findByText("Halaman tidak ditemukan")).toBeInTheDocument();
  });
});
