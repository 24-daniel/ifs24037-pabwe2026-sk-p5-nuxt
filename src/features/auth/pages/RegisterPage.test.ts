import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import RegisterPage from "./RegisterPage.vue";
import { registerRequest } from "../api/authApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { deferred, fail, ok, renderWithProviders } from "../../../test-utils";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

async function fillAndSubmit(wrapper: any) {
  await wrapper.get("#register-name-input").setValue("Budi");
  await wrapper.get("#register-email-input").setValue("budi@delcom.org");
  await wrapper.get("#register-password-input").setValue("rahasia");
  await wrapper.get("form").trigger("submit");
  await flushPromises();
}

describe("RegisterPage", () => {
  it("menampilkan form registrasi", async () => {
    const { wrapper } = await renderWithProviders(RegisterPage, { route: "/auth/register" });
    expect(wrapper.get("h1").text()).toBe("Buat akun");
    expect(wrapper.get("#register-submit-button").text()).toBe("Daftar");
    expect(wrapper.get("a").attributes("href")).toBe("/auth/login");
  });

  it("registrasi berhasil menampilkan dialog dan mengarah ke login", async () => {
    vi.mocked(registerRequest).mockResolvedValue(ok(null, "Berhasil mendaftar"));
    const { wrapper, router } = await renderWithProviders(RegisterPage, { route: "/auth/register" });
    await fillAndSubmit(wrapper);
    expect(registerRequest).toHaveBeenCalledWith("Budi", "budi@delcom.org", "rahasia");
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mendaftar");
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });

  it("registrasi gagal menampilkan dialog error", async () => {
    vi.mocked(registerRequest).mockResolvedValue(fail("Email sudah dipakai"));
    const { wrapper, router } = await renderWithProviders(RegisterPage, { route: "/auth/register" });
    await fillAndSubmit(wrapper);
    expect(showErrorDialog).toHaveBeenCalledWith("Email sudah dipakai");
    expect(router.currentRoute.value.path).toBe("/auth/register");
  });

  it("tombol menampilkan status proses", async () => {
    const pending = deferred<any>();
    vi.mocked(registerRequest).mockReturnValue(pending.promise);
    const { wrapper } = await renderWithProviders(RegisterPage, { route: "/auth/register" });
    await wrapper.get("form").trigger("submit");
    expect(wrapper.get("#register-submit-button").text()).toBe("Memproses...");
    pending.resolve(fail("x"));
    await flushPromises();
  });
});
