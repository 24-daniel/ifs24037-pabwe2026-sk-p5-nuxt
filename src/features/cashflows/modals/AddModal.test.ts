import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import AddModal from "./AddModal.vue";
import { addCashFlow } from "../api/cashFlowApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { deferred, fail, ok, renderWithProviders } from "../../../test-utils";

vi.mock("../api/cashFlowApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

const props = { open: true, labels: ["gaji", "makan"] };

async function fillForm(wrapper: any) {
  await wrapper.get("#add-type").setValue("outflow");
  await wrapper.get("#add-source").setValue("savings");
  await wrapper.get("#add-label").setValue("makan");
  await wrapper.get("#add-nominal").setValue("25000");
  await wrapper.get("#add-description").setValue("Makan siang");
}

describe("AddModal", () => {
  it("tidak dirender saat tertutup", async () => {
    const { wrapper } = await renderWithProviders(AddModal, { props: { ...props, open: false } });
    expect(wrapper.find("[role='dialog']").exists()).toBe(false);
  });

  it("menampilkan form dan opsi label", async () => {
    const { wrapper } = await renderWithProviders(AddModal, { props });
    expect(wrapper.get("#add-modal-title").text()).toBe("Tambah Arus Kas");
    expect(wrapper.findAll("datalist option").map((o) => o.attributes("value"))).toEqual(["gaji", "makan"]);
  });

  it("submit berhasil mengirim payload, menampilkan dialog, dan reset form", async () => {
    vi.mocked(addCashFlow).mockResolvedValue(ok({ cash_flow_id: 3 }, "Berhasil menambah"));
    const { wrapper } = await renderWithProviders(AddModal, { props });
    await fillForm(wrapper);
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(addCashFlow).toHaveBeenCalledWith({
      type: "outflow",
      source: "savings",
      label: "makan",
      nominal: 25000,
      description: "Makan siang",
    });
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil menambah");
    expect(wrapper.emitted("saved")).toHaveLength(1);
    expect((wrapper.get("#add-label").element as HTMLInputElement).value).toBe("");
    expect((wrapper.get("#add-type").element as HTMLSelectElement).value).toBe("inflow");
    expect((wrapper.get("#add-source").element as HTMLSelectElement).value).toBe("cash");
  });

  it("submit gagal menampilkan dialog error", async () => {
    vi.mocked(addCashFlow).mockResolvedValue(fail("Data tidak valid"));
    const { wrapper } = await renderWithProviders(AddModal, { props });
    await fillForm(wrapper);
    await wrapper.get("form").trigger("submit");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Data tidak valid");
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("tombol simpan menampilkan status proses", async () => {
    const pending = deferred<any>();
    vi.mocked(addCashFlow).mockReturnValue(pending.promise);
    const { wrapper } = await renderWithProviders(AddModal, { props });
    await wrapper.get("form").trigger("submit");
    expect(wrapper.get("button[type='submit']").text()).toBe("Menyimpan...");
    pending.resolve(fail("x"));
    await flushPromises();
    expect(wrapper.get("button[type='submit']").text()).toBe("Simpan");
  });

  it("tombol tutup dan batal memicu event close", async () => {
    const { wrapper } = await renderWithProviders(AddModal, { props });
    await wrapper.get("button[aria-label='Tutup']").trigger("click");
    await wrapper.get("button[type='button']:not([aria-label])").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});
