// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/vue";
import Swal from "sweetalert2";
import DetailPage from "./DetailPage.vue";
import * as api from "../api/cashFlowApi";
import { Blank, deferred, makeCashFlow, renderWithProviders } from "../../../test-utils";

vi.mock("../api/cashFlowApi");

const routes = [
  { path: "/cash-flows/:cashFlowId", component: Blank },
  { path: "/:pathMatch(.*)*", component: Blank },
];
const outflow = makeCashFlow({ id: 5, type: "outflow", source: "savings", label: "alat-elektronik", nominal: 400000, description: "Keyboard dan mouse" });
const inflow = makeCashFlow({ id: 5, type: "inflow", source: "loans", label: "pinjaman", nominal: 750000, description: "Pinjaman teman" });
const respond = (cashFlow) => api.getCashFlow.mockResolvedValue({ status: "success", message: "ok", data: { cash_flow: cashFlow } });
const render = (id = 5) => renderWithProviders(DetailPage, { route: `/cash-flows/${id}`, routes });

describe("DetailPage", () => {
  beforeEach(() => {
    respond(outflow);
    api.deleteCashFlow.mockResolvedValue({ status: "success", message: "Berhasil menghapus data" });
    api.changeCashFlow.mockResolvedValue({ status: "success", message: "Berhasil mengubah data" });
  });

  it("memuat detail berdasarkan parameter rute", async () => {
    const pending = deferred();
    api.getCashFlow.mockReturnValue(pending.promise);
    await render();
    expect(screen.getByText("Memuat detail transaksi…")).toBeInTheDocument();
    pending.resolve({ status: "success", message: "ok", data: { cash_flow: outflow } });
    expect(await screen.findByRole("heading", { name: "alat-elektronik" })).toBeInTheDocument();
    expect(api.getCashFlow).toHaveBeenCalledWith("5");
  });

  it("menampilkan rincian transaksi pengeluaran", async () => {
    await render();
    await screen.findByRole("heading", { name: "alat-elektronik" });
    expect(screen.getByText("Pengeluaran")).toBeInTheDocument();
    expect(screen.getByText("Tabungan")).toBeInTheDocument();
    expect(screen.getByText("Keyboard dan mouse")).toBeInTheDocument();
    expect(screen.getByText(/^-.*400\.000/)).toBeInTheDocument();
    expect(screen.getByText("Dibuat")).toBeInTheDocument();
    expect(screen.getByText("Diperbarui")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /kembali ke ringkasan/i })).toHaveAttribute("href", "/");
  });

  it("menampilkan rincian transaksi pemasukan", async () => {
    respond(inflow);
    await render();
    await screen.findByRole("heading", { name: "pinjaman" });
    expect(screen.getByText("Pemasukan")).toBeInTheDocument();
    expect(screen.getByText("Pinjaman")).toBeInTheDocument();
    expect(screen.getByText(/^\+.*750\.000/)).toBeInTheDocument();
  });

  it("menampilkan pesan jika transaksi tidak ditemukan", async () => {
    api.getCashFlow.mockResolvedValue({ status: "fail", message: "Data tidak ditemukan" });
    await render();
    expect(await screen.findByRole("heading", { name: "Transaksi tidak ditemukan" })).toBeInTheDocument();
  });

  it("Ubah membuka modal, bisa ditutup, dan menyimpan memuat ulang detail", async () => {
    await render();
    await screen.findByRole("heading", { name: "alat-elektronik" });
    await fireEvent.click(screen.getByRole("button", { name: "Ubah" }));
    const dialog = screen.getByRole("dialog", { name: "Ubah transaksi" });
    await fireEvent.click(within(dialog).getByLabelText("Tutup"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await fireEvent.click(screen.getByRole("button", { name: "Ubah" }));
    await fireEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(api.changeCashFlow).toHaveBeenCalledWith(5, expect.objectContaining({ label: "alat-elektronik" })));
    await waitFor(() => expect(api.getCashFlow).toHaveBeenCalledTimes(2));
  });

  it("hapus: gagal menampilkan error, batal tidak menghapus, berhasil kembali ke dashboard", async () => {
    const { router } = await render();
    await screen.findByRole("heading", { name: "alat-elektronik" });
    const remove = screen.getByRole("button", { name: "Hapus" });

    api.deleteCashFlow.mockResolvedValueOnce({ status: "fail", message: "Tidak boleh" });
    await fireEvent.click(remove);
    await waitFor(() => expect(Swal.fire.mock.calls.at(-1)[0]).toMatchObject({ icon: "error", text: "Tidak boleh" }));
    expect(router.currentRoute.value.path).toBe("/cash-flows/5");

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    await fireEvent.click(remove);
    await waitFor(() => expect(Swal.fire.mock.calls.at(-1)[0].icon).toBe("warning"));
    expect(api.deleteCashFlow).toHaveBeenCalledTimes(1);

    await fireEvent.click(remove);
    await waitFor(() => expect(router.currentRoute.value.path).toBe("/"));
    expect(api.deleteCashFlow).toHaveBeenLastCalledWith(5);
  });

  it("memuat ulang ketika parameter id berubah", async () => {
    const { router } = await render();
    await screen.findByRole("heading", { name: "alat-elektronik" });
    const pending = deferred();
    api.getCashFlow.mockReturnValue(pending.promise);
    await router.push("/cash-flows/6");
    await waitFor(() => expect(api.getCashFlow).toHaveBeenLastCalledWith("6"));
    pending.resolve({ status: "fail", message: "x" });
  });
});
