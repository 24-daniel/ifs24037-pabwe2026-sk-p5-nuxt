// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/vue";
import Swal from "sweetalert2";
import AddModal from "./AddModal.vue";
import * as api from "../api/cashFlowApi";
import { deferred, renderWithProviders } from "../../../test-utils";

vi.mock("../api/cashFlowApi");

const open = (extra = {}) => renderWithProviders(AddModal, { props: { open: true }, ...extra });
const fillAll = async () => {
  await fireEvent.click(screen.getByLabelText("Pengeluaran"));
  await fireEvent.update(screen.getByLabelText("Sumber dana"), "savings");
  await fireEvent.update(screen.getByLabelText("Label kategori"), "  makan ");
  await fireEvent.update(screen.getByLabelText("Nominal (Rp)"), "35000");
  await fireEvent.update(screen.getByLabelText("Keterangan"), " Makan siang ");
};
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Simpan transaksi" }));

describe("AddModal", () => {
  beforeEach(() => api.addCashFlow.mockResolvedValue({ status: "success", message: "Berhasil menambahkan data" }));

  it("tidak merender apa pun saat tertutup", async () => {
    await renderWithProviders(AddModal);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("menampilkan form dengan pilihan jenis, sumber, dan saran label", async () => {
    const { container } = await open({ initialState: { cashFlows: { labels: ["gaji", "makan"] } } });
    expect(screen.getByRole("dialog", { name: "Catat transaksi" })).toBeInTheDocument();
    expect(screen.getByLabelText("Pemasukan")).toBeChecked();
    expect(screen.getByLabelText("Sumber dana")).toHaveValue("cash");
    expect(container.querySelectorAll("#add-label-options option")).toHaveLength(2);
  });

  it("menampilkan error validasi", async () => {
    await open();
    await submit();
    expect(screen.getByText("Label wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Nominal harus lebih dari 0")).toBeInTheDocument();
    expect(screen.getByText("Keterangan wajib diisi")).toBeInTheDocument();
    expect(api.addCashFlow).not.toHaveBeenCalled();
  });

  it("berhasil mencatat transaksi, lalu emit saved dan close", async () => {
    const { emitted } = await open();
    await fillAll();
    await submit();
    await waitFor(() => expect(emitted().close).toHaveLength(1));
    expect(api.addCashFlow).toHaveBeenCalledWith({
      type: "outflow",
      source: "savings",
      label: "makan",
      nominal: 35000,
      description: "Makan siang",
    });
    expect(emitted().saved).toHaveLength(1);
    await waitFor(() => expect(Swal.fire.mock.calls[0][0]).toMatchObject({ icon: "success", title: "Transaksi dicatat" }));
  });

  it("gagal mencatat menampilkan dialog error dan tidak menutup modal", async () => {
    api.addCashFlow.mockResolvedValue({ status: "fail", message: "Data tidak valid", data: { label: ["Terlalu panjang"] } });
    const { emitted } = await open();
    await fillAll();
    await submit();
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    await waitFor(() => expect(Swal.fire.mock.calls[0][0]).toMatchObject({ icon: "error", text: "Data tidak valid\nTerlalu panjang" }));
    expect(emitted().close).toBeUndefined();
  });

  it("tombol menampilkan status menyimpan", async () => {
    const pending = deferred();
    api.addCashFlow.mockReturnValue(pending.promise);
    await open();
    await fillAll();
    await submit();
    expect(await screen.findByRole("button", { name: "Menyimpan…" })).toBeDisabled();
    pending.resolve({ status: "fail", message: "x" });
  });

  it("tombol batal dan tutup mengirim close", async () => {
    const { emitted } = await open();
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    await fireEvent.click(screen.getByLabelText("Tutup"));
    expect(emitted().close).toHaveLength(2);
  });

  it("form direset setiap kali dibuka kembali", async () => {
    const { rerender } = await open();
    await fillAll();
    await fireEvent.update(screen.getByLabelText("Label kategori"), "");
    await submit();
    expect(screen.getByText("Label wajib diisi")).toBeInTheDocument();
    await rerender({ open: false });
    await rerender({ open: true });
    expect(screen.getByLabelText("Label kategori")).toHaveValue("");
    expect(screen.getByLabelText("Pemasukan")).toBeChecked();
    expect(screen.getByLabelText("Sumber dana")).toHaveValue("cash");
    expect(screen.queryByText("Label wajib diisi")).not.toBeInTheDocument();
  });
});
