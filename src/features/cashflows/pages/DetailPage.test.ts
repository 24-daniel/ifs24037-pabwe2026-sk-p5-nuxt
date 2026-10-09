import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import DetailPage from "./DetailPage.vue";
import { deleteCashFlow, getCashFlow, getLabels, updateCashFlow } from "../api/cashFlowApi";
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { Blank, fail, inflowItem, ok, outflowItem, renderWithProviders } from "../../../test-utils";

vi.mock("../api/cashFlowApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const routes = [
  { path: "/cash-flows/:cashFlowId", component: Blank },
  { path: "/:pathMatch(.*)*", component: Blank },
];
const render = () => renderWithProviders(DetailPage, { route: "/cash-flows/1", routes });

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCashFlow).mockResolvedValue(ok({ cash_flow: inflowItem }));
  vi.mocked(getLabels).mockResolvedValue(ok({ labels: ["gaji"] }));
});

describe("DetailPage", () => {
  it("memuat detail berdasarkan id rute dan menampilkan rinciannya", async () => {
    const { wrapper } = await render();
    expect(getCashFlow).toHaveBeenCalledWith("1");
    expect(wrapper.get("h1").text()).toBe("gaji");
    const text = wrapper.text();
    expect(text).toContain("Pemasukan");
    expect(text).toContain("Tunai");
    expect(text).toMatch(/Rp\s1\.000\.000/);
    expect(text).toContain("Gaji bulanan");
    expect(text).toContain("Dibuat pada");
    expect(text).toContain("Diperbarui pada");
  });

  it("menampilkan badge pengeluaran", async () => {
    vi.mocked(getCashFlow).mockResolvedValue(ok({ cash_flow: outflowItem }));
    const { wrapper } = await render();
    expect(wrapper.text()).toContain("Pengeluaran");
    expect(wrapper.text()).toContain("Tabungan");
  });

  it("menampilkan status memuat", async () => {
    vi.mocked(getCashFlow).mockReturnValue(new Promise(() => {}));
    const { wrapper } = await render();
    expect(wrapper.text()).toContain("Memuat data...");
  });

  it("menampilkan pesan jika data tidak ditemukan", async () => {
    vi.mocked(getCashFlow).mockResolvedValue(fail("Tidak ada"));
    const { wrapper } = await render();
    expect(wrapper.text()).toContain("Catatan arus kas tidak ditemukan.");
  });

  it("ubah: membuka modal, menutup, lalu menyimpan dan memuat ulang", async () => {
    vi.mocked(updateCashFlow).mockResolvedValue(ok(null, "Diubah"));
    const { wrapper } = await render();
    const changeButton = wrapper.findAll("button").find((b) => b.text().includes("Ubah"))!;

    await changeButton.trigger("click");
    expect(wrapper.find("[role='dialog']").exists()).toBe(true);
    await wrapper.get("button[aria-label='Tutup']").trigger("click");
    expect(wrapper.find("[role='dialog']").exists()).toBe(false);

    await changeButton.trigger("click");
    await wrapper.get("[role='dialog'] form").trigger("submit");
    await flushPromises();
    expect(updateCashFlow).toHaveBeenCalledWith(1, expect.any(Object));
    expect(wrapper.find("[role='dialog']").exists()).toBe(false);
    expect(getCashFlow).toHaveBeenCalledTimes(2);
  });

  const deleteButton = (wrapper: any) => wrapper.findAll("button").find((b: any) => b.text().includes("Hapus"))!;

  it("hapus berhasil mengarahkan ke beranda", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(deleteCashFlow).mockResolvedValue(ok(null, "Terhapus"));
    const { wrapper, router } = await render();
    await deleteButton(wrapper).trigger("click");
    await flushPromises();
    expect(deleteCashFlow).toHaveBeenCalledWith("1");
    expect(showSuccessDialog).toHaveBeenCalledWith("Terhapus");
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("hapus dibatalkan jika konfirmasi ditolak", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    const { wrapper, router } = await render();
    await deleteButton(wrapper).trigger("click");
    await flushPromises();
    expect(deleteCashFlow).not.toHaveBeenCalled();
    expect(router.currentRoute.value.path).toBe("/cash-flows/1");
  });

  it("hapus gagal menampilkan dialog error", async () => {
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(deleteCashFlow).mockResolvedValue(fail("Gagal hapus"));
    const { wrapper } = await render();
    await deleteButton(wrapper).trigger("click");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal hapus");
  });
});
