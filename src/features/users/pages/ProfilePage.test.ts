import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ProfilePage from "./ProfilePage.vue";
import { changePassword, getMe, updateMe, uploadPhoto } from "../api/userApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { fail, ok, renderWithProviders, sampleUser } from "../../../test-utils";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getMe).mockResolvedValue(ok({ user: sampleUser }));
});

const value = (wrapper: any, selector: string) => (wrapper.get(selector).element as HTMLInputElement).value;

describe("ProfilePage - tampilan", () => {
  it("mengisi form dari profil dan menampilkan inisial tanpa foto", async () => {
    const { wrapper } = await renderWithProviders(ProfilePage);
    expect(value(wrapper, "#profile-name")).toBe("Budi Santoso");
    expect(value(wrapper, "#profile-email")).toBe("budi@delcom.org");
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toContain("B");
  });

  it("menampilkan foto profil jika tersedia", async () => {
    vi.mocked(getMe).mockResolvedValue(ok({ user: { ...sampleUser, photo: "https://x.test/p.png" } }));
    const { wrapper } = await renderWithProviders(ProfilePage);
    expect(wrapper.get("img").attributes("src")).toBe("https://x.test/p.png");
  });

  it("form tetap kosong jika profil gagal dimuat", async () => {
    vi.mocked(getMe).mockResolvedValue(fail());
    const { wrapper } = await renderWithProviders(ProfilePage);
    expect(value(wrapper, "#profile-name")).toBe("");
  });
});

describe("ProfilePage - ubah data", () => {
  it("berhasil", async () => {
    vi.mocked(updateMe).mockResolvedValue(ok({ user: { ...sampleUser, name: "Baru" } }, "Data diubah"));
    const { wrapper } = await renderWithProviders(ProfilePage);
    await wrapper.get("#profile-name").setValue("Baru");
    await wrapper.get("#profile-email").setValue("baru@delcom.org");
    await wrapper.findAll("form")[0].trigger("submit");
    await flushPromises();
    expect(updateMe).toHaveBeenCalledWith("Baru", "baru@delcom.org");
    expect(showSuccessDialog).toHaveBeenCalledWith("Data diubah");
  });

  it("gagal", async () => {
    vi.mocked(updateMe).mockResolvedValue(fail("Email dipakai"));
    const { wrapper } = await renderWithProviders(ProfilePage);
    await wrapper.findAll("form")[0].trigger("submit");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Email dipakai");
  });
});

describe("ProfilePage - foto", () => {
  async function pickFile(wrapper: any, files: File[]) {
    const input = wrapper.get("#profile-photo");
    Object.defineProperty(input.element, "files", { value: files, configurable: true });
    await input.trigger("change");
    await flushPromises();
  }

  it("berhasil mengunggah dan memuat ulang profil", async () => {
    vi.mocked(uploadPhoto).mockResolvedValue(ok(null, "Foto diubah"));
    const { wrapper } = await renderWithProviders(ProfilePage);
    const file = new File(["x"], "a.png", { type: "image/png" });
    await pickFile(wrapper, [file]);
    expect(uploadPhoto).toHaveBeenCalledWith(file);
    expect(showSuccessDialog).toHaveBeenCalledWith("Foto diubah");
    expect(getMe).toHaveBeenCalledTimes(2);
  });

  it("gagal mengunggah", async () => {
    vi.mocked(uploadPhoto).mockResolvedValue(fail("Format salah"));
    const { wrapper } = await renderWithProviders(ProfilePage);
    await pickFile(wrapper, [new File(["x"], "a.txt")]);
    expect(showErrorDialog).toHaveBeenCalledWith("Format salah");
  });

  it("tanpa file tidak melakukan apa pun", async () => {
    const { wrapper } = await renderWithProviders(ProfilePage);
    await pickFile(wrapper, []);
    expect(uploadPhoto).not.toHaveBeenCalled();
  });
});

describe("ProfilePage - ubah kata sandi", () => {
  async function submitPassword(wrapper: any) {
    await wrapper.get("#profile-password").setValue("lama");
    await wrapper.get("#profile-new-password").setValue("baru123");
    await wrapper.get("#profile-confirmation").setValue("baru123");
    await wrapper.findAll("form")[1].trigger("submit");
    await flushPromises();
  }

  it("berhasil dan mengosongkan form", async () => {
    vi.mocked(changePassword).mockResolvedValue(ok(null, "Sandi diubah"));
    const { wrapper } = await renderWithProviders(ProfilePage);
    await submitPassword(wrapper);
    expect(changePassword).toHaveBeenCalledWith("lama", "baru123", "baru123");
    expect(showSuccessDialog).toHaveBeenCalledWith("Sandi diubah");
    expect(value(wrapper, "#profile-password")).toBe("");
    expect(value(wrapper, "#profile-new-password")).toBe("");
    expect(value(wrapper, "#profile-confirmation")).toBe("");
  });

  it("gagal menampilkan dialog error", async () => {
    vi.mocked(changePassword).mockResolvedValue(fail("Sandi lama salah"));
    const { wrapper } = await renderWithProviders(ProfilePage);
    await submitPassword(wrapper);
    expect(showErrorDialog).toHaveBeenCalledWith("Sandi lama salah");
    expect(value(wrapper, "#profile-password")).toBe("lama");
  });
});
