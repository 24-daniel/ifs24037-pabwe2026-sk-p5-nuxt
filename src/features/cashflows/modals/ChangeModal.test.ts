import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ChangeModal from "./ChangeModal.vue";
import { updateCashFlow } from "../api/cashFlowApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { deferred, fail, inflowItem, ok, outflowItem, renderWithProviders } from "../../../test-utils";

vi.mock("../api/cashFlowApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

const props = { open: true, cashFlow: inflowItem, labels: ["gaji", "makan"] };

describe("ChangeModal", () => {
  it("tidak dirender saat tertutup atau tanpa data", async () => {
    const closed = await renderWithProviders(ChangeModal, { props: { ...props, open: false } });
    expect(closed.wrapper.find("[role='dialog']").exists()).toBe(false);
    const empty = await renderWithProviders(ChangeModal, { props: { ...props, cashFlow: null } });
    expect(empty.wrapper.find("[role='dialog']").exists()).toBe(false);
  });

  it("mengisi form dari data dan mengikuti perubahan props", async () => {
    const { wrapper } = await renderWithProviders(ChangeModal, { props });
    expect((wrapper.get("#change-label").element as HTMLInputElement).value).toBe("gaji");
    expect((wrapper.get("#change-nominal").element as HTMLInputElement).value).toBe("1000000");
    expect((wrapper.get("#change-type").element as HTMLSelectElement).value).toBe("inflow");
    expect((wrapper.get("#change-source").element as HTMLSelectElement).value).toBe("cash");
    expect((wrapper.get("#change-description").element as HTMLTextAreaElement).value).toBe("Gaji bulanan");

    await wrapper.setProps({ cashFlow: outflowItem });
    expect((wrapper.get("#change-label").element as HTMLInputElement).value).toBe("makan");
    expect((wrapper.get("#change-type").element as HTMLSelectElement).value).toBe("outflow");

    await wrapper.setProps({ cashFlow: null });
    expect(wrapper.find("[role='dialog']").exists()).toBe(false);
  });

  it("submit berhasil memanggil API ubah", async () => {
    vi.mocked(updateCashFlow).mockResolvedValue(ok(null, "Berhasil mengubah"));
    const { wrapper } = await renderWithProviders(ChangeModal, { props });
    await wrapper.get("#change-label").setValue("bonus");
    await wrapper.get("#change-nominal").setValue("2000000");
    await wrapper.get("#change-description").setValue("Bonus tahunan");
    await wrapper.get("#change-type").setValue("outflow");
    await wrapper.get("#change-source").setValue("loans");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(updateCashFlow).toHaveBeenCalledWith(1, {
      type: "outflow",
      source: "loans",
      label: "bonus",
      nominal: 2000000,
      description: "Bonus tahunan",
    });
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mengubah");
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("submit gagal menampilkan dialog error", async () => {
    vi.mocked(updateCashFlow).mockResolvedValue(fail("Tidak valid"));
    const { wrapper } = await renderWithProviders(ChangeModal, { props });
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Tidak valid");
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("tombol simpan menampilkan status proses", async () => {
    const pending = deferred<any>();
    vi.mocked(updateCashFlow).mockReturnValue(pending.promise);
    const { wrapper } = await renderWithProviders(ChangeModal, { props });
    await wrapper.get("form").trigger("submit");
    expect(wrapper.get("button[type='submit']").text()).toBe("Menyimpan...");
    pending.resolve(fail("x"));
    await flushPromises();
    expect(wrapper.get("button[type='submit']").text()).toBe("Simpan Perubahan");
  });

  it("tombol tutup dan batal memicu event close", async () => {
    const { wrapper } = await renderWithProviders(ChangeModal, { props });
    await wrapper.get("button[aria-label='Tutup']").trigger("click");
    await wrapper.get("button[type='button']:not([aria-label])").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});
