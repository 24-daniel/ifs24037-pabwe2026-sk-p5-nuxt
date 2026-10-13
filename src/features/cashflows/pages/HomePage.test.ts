// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/vue";
import Swal from "sweetalert2";
import HomePage from "./HomePage.vue";
import * as api from "../api/cashFlowApi";
import { deferred, makeCashFlow, renderWithProviders } from "../../../test-utils";

vi.mock("../api/cashFlowApi");

const salary = makeCashFlow({ id: 2, type: "inflow", source: "cash", label: "gaji", nominal: 2500000, description: "Gaji bulanan" });
const soap = makeCashFlow({ id: 3, type: "outflow", source: "cash", label: "alat-mandi", nominal: 100000 });
const keyboard = makeCashFlow({ id: 4, type: "outflow", source: "savings", label: "alat-elektronik", nominal: 400000 });
const stats = {
  cashflow: 2000000,
  total_inflow: 2500000,
  total_outflow: 500000,
  total_inflow_cash: 2500000,
  total_outflow_cash: 100000,
  total_outflow_savings: 400000,
};
const daily = {
  stats_inflow: { "04-10-2024": 0, "05-10-2024": 2500000 },
  stats_outflow: { "04-10-2024": 0, "05-10-2024": 500000 },
  stats_cashflow: {},
};
const monthly = {
  stats_inflow: { "09-2024": 1000000, "10-2024": 2500000 },
  stats_outflow: { "10-2024": 500000 }, // sengaja tanpa kunci "09-2024"
  stats_cashflow: {},
};
const ok = (data) => ({ status: "success", message: "ok", data });
const fail = { status: "fail", message: "Gagal total" };

const render = (initialState = {}) => renderWithProviders(HomePage, { route: "/", initialState });
const rows = () => screen.getAllByTestId("cashflow-row");
const row = (label) => rows().find((el) => within(el).queryByText(label));
const lastParams = () => api.getCashFlows.mock.calls.at(-1)[0];

describe("HomePage", () => {
  beforeEach(() => {
    api.getCashFlows.mockResolvedValue(ok({ cash_flows: [salary, soap, keyboard], stats }));
    api.getLabels.mockResolvedValue(ok({ labels: ["gaji", "alat-mandi"] }));
    api.getStatsDaily.mockResolvedValue(ok(daily));
    api.getStatsMonthly.mockResolvedValue(ok(monthly));
    api.deleteCashFlow.mockResolvedValue({ status: "success", message: "Berhasil menghapus data" });
    api.deleteAllCashFlows.mockResolvedValue({ status: "success", message: "Berhasil menghapus semua data cash flow" });
    api.addCashFlow.mockResolvedValue({ status: "success", message: "Berhasil menambahkan data" });
    api.changeCashFlow.mockResolvedValue({ status: "success", message: "Berhasil mengubah data" });
  });

  it("menampilkan kartu metrik ringkasan keuangan", async () => {
    await render();
    await waitFor(() => expect(rows()).toHaveLength(3));
    expect(within(screen.getByTestId("metric-balance")).getByText(/2\.000\.000/)).toBeInTheDocument();
    expect(screen.getByText("Total saldo kas bersih")).toBeInTheDocument();
    expect(within(screen.getByTestId("metric-inflow")).getByText(/2\.500\.000/)).toBeInTheDocument();
    expect(within(screen.getByTestId("metric-outflow")).getByText(/500\.000/)).toBeInTheDocument();
    expect(within(screen.getByTestId("metric-cash")).getByText(/2\.400\.000/)).toBeInTheDocument();
    expect(within(screen.getByTestId("metric-savings")).getByText(/-.*400\.000/)).toBeInTheDocument();
    expect(within(screen.getByTestId("metric-loans")).getByText(/Rp\s?0/)).toBeInTheDocument();
  });

  it("menampilkan tabel transaksi dengan badge jenis dan tanda nominal", async () => {
    await render();
    await waitFor(() => expect(rows()).toHaveLength(3));
    expect(api.getCashFlows).toHaveBeenCalledWith({});
    const inflow = within(row("gaji"));
    expect(inflow.getByText("Pemasukan")).toBeInTheDocument();
    expect(inflow.getByText("Tunai")).toBeInTheDocument();
    expect(inflow.getByText(/^\+/)).toHaveTextContent(/2\.500\.000/);
    const outflow = within(row("alat-elektronik"));
    expect(outflow.getByText("Pengeluaran")).toBeInTheDocument();
    expect(outflow.getByText("Tabungan")).toBeInTheDocument();
    expect(outflow.getByText(/^-/)).toHaveTextContent(/400\.000/);
    expect(screen.getByRole("link", { name: "Lihat detail gaji" })).toHaveAttribute("href", "/cash-flows/2");
  });

  it("menampilkan status memuat dan keadaan kosong", async () => {
    const pending = deferred();
    api.getCashFlows.mockReturnValue(pending.promise);
    await render();
    expect(screen.getByText("Memuat transaksi…")).toBeInTheDocument();
    pending.resolve(ok({ cash_flows: [], stats: {} }));
    expect(await screen.findByText(/Belum ada transaksi yang cocok/)).toBeInTheDocument();
  });

  it("memuat daftar label ke filter", async () => {
    await render();
    await waitFor(() => expect(screen.getByRole("option", { name: "alat-mandi" })).toBeInTheDocument());
    expect(screen.getByRole("option", { name: "gaji" })).toBeInTheDocument();
  });

  it("filter jenis, sumber, label, dan rentang tanggal memuat ulang dengan parameter yang sesuai", async () => {
    await render();
    await waitFor(() => expect(rows()).toHaveLength(3));
    expect(screen.queryByRole("button", { name: "Hapus semua filter" })).not.toBeInTheDocument();

    await fireEvent.update(screen.getByLabelText("Jenis"), "outflow");
    await waitFor(() => expect(lastParams()).toEqual({ type: "outflow" }));
    await fireEvent.update(screen.getByLabelText("Sumber dana"), "savings");
    await waitFor(() => expect(lastParams()).toEqual({ type: "outflow", source: "savings" }));
    await fireEvent.update(screen.getByLabelText("Label"), "alat-mandi");
    await waitFor(() => expect(lastParams().label).toBe("alat-mandi"));
    await fireEvent.update(screen.getByLabelText("Tanggal awal"), "2024-10-01");
    await fireEvent.update(screen.getByLabelText("Tanggal akhir"), "2024-10-31");
    await waitFor(() =>
      expect(lastParams()).toEqual({
        type: "outflow",
        source: "savings",
        label: "alat-mandi",
        start_date: "2024-10-01 00:00:00",
        end_date: "2024-10-31 23:59:59",
      }),
    );

    await fireEvent.click(screen.getByRole("button", { name: "Hapus semua filter" }));
    await waitFor(() => expect(lastParams()).toEqual({}));
    expect(screen.getByLabelText("Jenis")).toHaveValue("");
    expect(screen.queryByRole("button", { name: "Hapus semua filter" })).not.toBeInTheDocument();
  });

  it("tren harian ditampilkan lebih dulu dan bisa beralih ke bulanan", async () => {
    await render();
    const chart = await screen.findByTestId("trend-chart");
    expect(within(chart).getAllByRole("listitem")).toHaveLength(2);
    expect(within(chart).getByText("05/10")).toBeInTheDocument();
    expect(within(chart).getByText(/05-10-2024: pemasukan.*2\.500\.000.*pengeluaran.*500\.000/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Harian" })).toHaveAttribute("aria-pressed", "true");

    await fireEvent.click(screen.getByRole("button", { name: "Bulanan" }));
    expect(screen.getByRole("button", { name: "Bulanan" })).toHaveAttribute("aria-pressed", "true");
    expect(within(screen.getByTestId("trend-chart")).getByText("10/2024")).toBeInTheDocument();
    expect(within(screen.getByTestId("trend-chart")).getByText(/09-2024: pemasukan.*pengeluaran.*Rp\s?0/)).toBeInTheDocument();

    await fireEvent.click(screen.getByRole("button", { name: "Harian" }));
    expect(screen.getByText("05/10")).toBeInTheDocument();
  });

  it("tren kosong menampilkan pesan", async () => {
    api.getStatsDaily.mockResolvedValue(fail);
    await render();
    expect(await screen.findByText("Data tren belum tersedia.")).toBeInTheDocument();
  });

  it("Catat transaksi membuka AddModal, bisa ditutup, dan menyimpan memuat ulang semua data", async () => {
    await render();
    await waitFor(() => expect(rows()).toHaveLength(3));
    await fireEvent.click(screen.getByRole("button", { name: /catat transaksi/i }));
    const dialog = screen.getByRole("dialog", { name: "Catat transaksi" });
    await fireEvent.click(within(dialog).getByLabelText("Tutup"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await fireEvent.click(screen.getByRole("button", { name: /catat transaksi/i }));
    await fireEvent.update(screen.getByLabelText("Label kategori"), "makan");
    await fireEvent.update(screen.getByLabelText("Nominal (Rp)"), "20000");
    await fireEvent.update(screen.getByLabelText("Keterangan"), "Makan siang");
    await fireEvent.click(screen.getByRole("button", { name: "Simpan transaksi" }));
    await waitFor(() => expect(api.addCashFlow).toHaveBeenCalled());
    await waitFor(() => expect(api.getCashFlows).toHaveBeenCalledTimes(2));
    expect(api.getLabels).toHaveBeenCalledTimes(2);
    expect(api.getStatsDaily).toHaveBeenCalledTimes(2);
  });

  it("Ubah membuka ChangeModal berisi data transaksi dan menyimpan memuat ulang daftar", async () => {
    await render();
    await waitFor(() => expect(rows()).toHaveLength(3));
    await fireEvent.click(screen.getByRole("button", { name: "Ubah alat-mandi" }));
    const dialog = screen.getByRole("dialog", { name: "Ubah transaksi" });
    expect(within(dialog).getByLabelText("Label kategori")).toHaveValue("alat-mandi");
    await fireEvent.click(within(dialog).getByLabelText("Tutup"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await fireEvent.click(screen.getByRole("button", { name: "Ubah alat-mandi" }));
    await fireEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(api.changeCashFlow).toHaveBeenCalledWith(3, expect.objectContaining({ label: "alat-mandi" })));
    await waitFor(() => expect(api.getCashFlows).toHaveBeenCalledTimes(2));
  });

  it("hapus transaksi: berhasil memuat ulang, gagal menampilkan error, batal tidak melakukan apa pun", async () => {
    await render();
    await waitFor(() => expect(rows()).toHaveLength(3));
    const trash = screen.getByRole("button", { name: "Hapus gaji" });

    await fireEvent.click(trash);
    await waitFor(() => expect(api.deleteCashFlow).toHaveBeenCalledWith(2));
    await waitFor(() => expect(api.getCashFlows).toHaveBeenCalledTimes(2));

    api.deleteCashFlow.mockResolvedValue(fail);
    await fireEvent.click(trash);
    await waitFor(() => expect(Swal.fire.mock.calls.at(-1)[0]).toMatchObject({ icon: "error", text: "Gagal total" }));

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await fireEvent.click(trash);
    await waitFor(() => expect(Swal.fire.mock.calls.at(-1)[0].icon).toBe("warning"));
    expect(api.deleteCashFlow).toHaveBeenCalledTimes(2);
  });

  it("reset semua transaksi: berhasil, gagal, dan dibatalkan", async () => {
    await render();
    await waitFor(() => expect(rows()).toHaveLength(3));
    const reset = screen.getByRole("button", { name: /reset semua transaksi/i });

    await fireEvent.click(reset);
    await waitFor(() => expect(api.deleteAllCashFlows).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(api.getCashFlows).toHaveBeenCalledTimes(2));

    api.deleteAllCashFlows.mockResolvedValue({ status: "fail", message: "Unauthenticated." });
    await fireEvent.click(reset);
    await waitFor(() => expect(Swal.fire.mock.calls.at(-1)[0]).toMatchObject({ icon: "error", text: "Unauthenticated." }));

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await fireEvent.click(reset);
    await waitFor(() => expect(Swal.fire.mock.calls.at(-1)[0].icon).toBe("warning"));
    expect(api.deleteAllCashFlows).toHaveBeenCalledTimes(2);
  });
});
