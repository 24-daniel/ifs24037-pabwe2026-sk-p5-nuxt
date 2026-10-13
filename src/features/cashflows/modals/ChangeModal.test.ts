// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/vue";
import Swal from "sweetalert2";
import ChangeModal from "./ChangeModal.vue";
import * as api from "../api/cashFlowApi";
import { deferred, makeCashFlow, renderWithProviders } from "../../../test-utils";

vi.mock("../api/cashFlowApi");

const cashFlow = makeCashFlow({ id: 9, type: "inflow", source: "savings", label: "gaji", nominal: 2500000, description: "Gaji bulanan" });
const open = (props = {}, extra = {}) => renderWithProviders(ChangeModal, { props: { open: true, cashFlow, ...props }, ...extra });
const save = () => fireEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));

describe("ChangeModal", () => {
  beforeEach(() => api.changeCashFlow.mockResolvedValue({ status: "success", message: "Berhasil mengubah data" }));

  it("tidak merender apa pun saat tertutup", async () => {
    await open({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("terisi dengan data transaksi saat terbuka", async () => {
    const { container } = await open({}, { initialState: { cashFlows: { labels: ["gaji"] } } });
    expect(screen.getByRole("dialog", { name: "Ubah transaksi" })).toBeInTheDocument();
    expect(screen.getByLabelText("Pemasukan")).toBeChecked();
    expect(screen.getByLabelText("Sumber dana")).toHaveValue("savings");
    expect(screen.getByLabelText("Label kategori")).toHaveValue("gaji");
    expect(screen.getByLabelText("Nominal (Rp)")).toHaveValue(2500000);
    expect(screen.getByLabelText("Keterangan")).toHaveValue("Gaji bulanan");
    expect(container.querySelectorAll("#change-label-options option")).toHaveLength(1);
  });

  it("terisi ulang ketika dibuka setelah tertutup", async () => {
    const { rerender } = await open({ open: false });
    await rerender({ open: true });
    expect(screen.getByLabelText("Label kategori")).toHaveValue("gaji");
  });

  it("validasi menolak data kosong", async () => {
    await open();
    await fireEvent.update(screen.getByLabelText("Label kategori"), "");
    await fireEvent.update(screen.getByLabelText("Nominal (Rp)"), "0");
    await fireEvent.update(screen.getByLabelText("Keterangan"), "");
    await save();
    expect(screen.getByText("Label wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Nominal harus lebih dari 0")).toBeInTheDocument();
    expect(screen.getByText("Keterangan wajib diisi")).toBeInTheDocument();
    expect(api.changeCashFlow).not.toHaveBeenCalled();
  });

  it("berhasil menyimpan perubahan", async () => {
    const { emitted } = await open();
    await fireEvent.click(screen.getByLabelText("Pengeluaran"));
    await fireEvent.update(screen.getByLabelText("Sumber dana"), "loans");
    await fireEvent.update(screen.getByLabelText("Label kategori"), " bonus ");
    await save();
    await waitFor(() => expect(emitted().close).toHaveLength(1));
    expect(api.changeCashFlow).toHaveBeenCalledWith(9, {
      type: "outflow",
      source: "loans",
      label: "bonus",
      nominal: 2500000,
      description: "Gaji bulanan",
    });
    expect(emitted().saved).toHaveLength(1);
    expect(Swal.fire.mock.calls[0][0]).toMatchObject({ icon: "success", title: "Transaksi diperbarui" });
  });

  it("gagal menyimpan menampilkan dialog error", async () => {
    api.changeCashFlow.mockResolvedValue({ status: "fail", message: "Ditolak" });
    const { emitted } = await open();
    await save();
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(Swal.fire.mock.calls[0][0]).toMatchObject({ icon: "error", text: "Ditolak" });
    expect(emitted().close).toBeUndefined();
  });

  it("status menyimpan dan tombol tutup", async () => {
    const pending = deferred();
    api.changeCashFlow.mockReturnValue(pending.promise);
    const { emitted } = await open();
    await save();
    expect(await screen.findByRole("button", { name: "Menyimpan…" })).toBeDisabled();
    pending.resolve({ status: "fail", message: "x" });
    await fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    await fireEvent.click(screen.getByLabelText("Tutup"));
    expect(emitted().close).toHaveLength(2);
  });
});
