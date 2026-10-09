import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import HomePage from "./HomePage.vue";
import {
  addCashFlow,
  deleteAllCashFlows,
  deleteCashFlow,
  getCashFlows,
  getLabels,
  updateCashFlow,
} from "../api/cashFlowApi";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import { fail, inflowItem, ok, outflowItem, rawStats, renderWithProviders } from "../../../test-utils";

vi.mock("../api/cashFlowApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const listResponse = () => ok({ cash_flows: [inflowItem, outflowItem], stats: rawStats });

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCashFlows).mockResolvedValue(listResponse());
  vi.mocked(getLabels).mockResolvedValue(ok({ labels: ["gaji", "makan"] }));
});

const emptyFilters = { type: "", source: "", label: "", start_date: "", end_date: "" };

describe("HomePage - tampilan", () => {
  it("memuat data awal tanpa filter dan menampilkan kartu ringkasan", async () => {
    const { wrapper } = await renderWithProviders(HomePage);
    expect(getCashFlows).toHaveBeenCalledWith(emptyFilters);
    expect(getLabels).toHaveBeenCalledTimes(1);
    const text = wrapper.text();
    expect(text).toContain("Total Saldo Kas Bersih");
    expect(text).toMatch(/Rp\s975\.000/);
    expect(text).toMatch(/Rp\s1\.000\.000/);
    expect(text).toContain("Saldo Rekening Tabungan");
    expect(text).toContain("Saldo Pinjaman");
  });

  it("menampilkan baris transaksi dengan badge dan aksi", async () => {
    const { wrapper } = await renderWithProviders(HomePage);
    const rows = wrapper.findAll("tbody tr");
    expect(rows).toHaveLength(2);
    expect(rows[0].text()).toContain("gaji");
    expect(rows[0].text()).toContain("Pemasukan");
    expect(rows[0].text()).toContain("Tunai");
    expect(rows[1].text()).toContain("Pengeluaran");
    expect(rows[1].text()).toContain("Tabungan");
    expect(rows[0].get("a").attributes("href")).toBe("/cash-flows/1");
  });

  it("menampilkan status memuat", async () => {
    vi.mocked(getCashFlows).mockReturnValue(new Promise(() => {}));
    const { wrapper } = await renderWithProviders(HomePage);
    expect(wrapper.text()).toContain("Memuat data...");
  });

  it("menampilkan keadaan kosong", async () => {
    vi.mocked(getCashFlows).mockResolvedValue(ok({ cash_flows: [], stats: {} }));
    const { wrapper } = await renderWithProviders(HomePage);
    expect(wrapper.text()).toContain("Belum ada catatan arus kas.");
  });
});

describe("HomePage - filter", () => {
  it("menerapkan filter dengan format tanggal API", async () => {
    const { wrapper } = await renderWithProviders(HomePage);
    await wrapper.get("#filter-type").setValue("inflow");
    await wrapper.get("#filter-source").setValue("cash");
    await wrapper.get("#filter-label").setValue("gaji");
    await wrapper.get("#filter-start").setValue("2024-10-01");
    await wrapper.get("#filter-end").setValue("2024-10-31");
    await wrapper.get("form[aria-label='Filter transaksi']").trigger("submit");
    await flushPromises();
    expect(getCashFlows).toHaveBeenLastCalledWith({
      type: "inflow",
      source: "cash",
      label: "gaji",
      start_date: "2024-10-01 00:00:00",
      end_date: "2024-10-31 23:59:59",
    });
  });

  it("reset filter mengosongkan semua kriteria", async () => {
    const { wrapper } = await renderWithProviders(HomePage);
    await wrapper.get("#filter-type").setValue("outflow");
    const resetButton = wrapper.findAll("button").find((b) => b.text().includes("Reset Filter"))!;
    await resetButton.trigger("click");
    await flushPromises();
    expect(getCashFlows).toHaveBeenLastCalledWith(emptyFilters);
    expect((wrapper.get("#filter-type").element as HTMLSelectElement).value).toBe("");
  });
});

describe("HomePage - hapus satu transaksi", () => {
  const deleteButton = (wrapper: any) => wrapper.get("button[aria-label='Hapus gaji']");

  it("berhasil setelah konfirmasi", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(deleteCashFlow).mockResolvedValue(ok(null, "Terhapus"));
    const { wrapper } = await renderWithProviders(HomePage);
    await deleteButton(wrapper).trigger("click");
    await flushPromises();
    expect(deleteCashFlow).toHaveBeenCalledWith(1);
    expect(showSuccessDialog).toHaveBeenCalledWith("Terhapus");
    expect(getCashFlows).toHaveBeenCalledTimes(2);
  });

  it("dibatalkan jika konfirmasi ditolak", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    const { wrapper } = await renderWithProviders(HomePage);
    await deleteButton(wrapper).trigger("click");
    await flushPromises();
    expect(deleteCashFlow).not.toHaveBeenCalled();
  });

  it("menampilkan error jika API gagal", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(deleteCashFlow).mockResolvedValue(fail("Tidak bisa dihapus"));
    const { wrapper } = await renderWithProviders(HomePage);
    await deleteButton(wrapper).trigger("click");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Tidak bisa dihapus");
  });
});

describe("HomePage - reset semua", () => {
  const resetAllButton = (wrapper: any) =>
    wrapper.findAll("button").find((b: any) => b.text().includes("Reset Semua"))!;

  it("berhasil setelah konfirmasi", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(deleteAllCashFlows).mockResolvedValue(ok(null, "Semua terhapus"));
    const { wrapper } = await renderWithProviders(HomePage);
    await resetAllButton(wrapper).trigger("click");
    await flushPromises();
    expect(deleteAllCashFlows).toHaveBeenCalledTimes(1);
    expect(showSuccessDialog).toHaveBeenCalledWith("Semua terhapus");
    expect(getCashFlows).toHaveBeenCalledTimes(2);
  });

  it("dibatalkan jika konfirmasi ditolak", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    const { wrapper } = await renderWithProviders(HomePage);
    await resetAllButton(wrapper).trigger("click");
    await flushPromises();
    expect(deleteAllCashFlows).not.toHaveBeenCalled();
  });

  it("menampilkan error jika API gagal", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(deleteAllCashFlows).mockResolvedValue(fail("Gagal reset"));
    const { wrapper } = await renderWithProviders(HomePage);
    await resetAllButton(wrapper).trigger("click");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal reset");
  });
});

describe("HomePage - modal", () => {
  it("membuka modal tambah, menutupnya, lalu menyimpan transaksi baru", async () => {
    vi.mocked(addCashFlow).mockResolvedValue(ok({ cash_flow_id: 9 }, "Ditambah"));
    const { wrapper } = await renderWithProviders(HomePage);
    expect(wrapper.find("[role='dialog']").exists()).toBe(false);

    const openButton = wrapper.findAll("button").find((b) => b.text().includes("Tambah Transaksi"))!;
    await openButton.trigger("click");
    expect(wrapper.get("#add-modal-title").text()).toBe("Tambah Arus Kas");

    await wrapper.get("button[aria-label='Tutup']").trigger("click");
    expect(wrapper.find("[role='dialog']").exists()).toBe(false);

    await openButton.trigger("click");
    await wrapper.get("#add-label").setValue("bonus");
    await wrapper.get("#add-nominal").setValue("500");
    await wrapper.get("#add-description").setValue("Bonus");
    await wrapper.get("[role='dialog'] form").trigger("submit");
    await flushPromises();

    expect(addCashFlow).toHaveBeenCalledTimes(1);
    expect(wrapper.find("[role='dialog']").exists()).toBe(false);
    expect(getCashFlows).toHaveBeenCalledTimes(2);
  });

  it("membuka modal ubah, menutupnya, lalu menyimpan perubahan", async () => {
    vi.mocked(updateCashFlow).mockResolvedValue(ok(null, "Diubah"));
    const { wrapper } = await renderWithProviders(HomePage);

    await wrapper.get("button[aria-label='Ubah gaji']").trigger("click");
    expect(wrapper.get("#change-modal-title").text()).toBe("Ubah Arus Kas");
    expect((wrapper.get("#change-label").element as HTMLInputElement).value).toBe("gaji");

    await wrapper.get("button[aria-label='Tutup']").trigger("click");
    expect(wrapper.find("[role='dialog']").exists()).toBe(false);

    await wrapper.get("button[aria-label='Ubah gaji']").trigger("click");
    await wrapper.get("[role='dialog'] form").trigger("submit");
    await flushPromises();

    expect(updateCashFlow).toHaveBeenCalledWith(1, expect.objectContaining({ label: "gaji" }));
    expect(wrapper.find("[role='dialog']").exists()).toBe(false);
    expect(getCashFlows).toHaveBeenCalledTimes(2);
  });
});
