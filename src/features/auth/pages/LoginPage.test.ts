import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import LoginPage from "./LoginPage.vue";
import { loginRequest } from "../api/authApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { deferred, fail, ok, renderWithProviders, sampleUser } from "../../../test-utils";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

async function fillAndSubmit(wrapper: any) {
  await wrapper.get("#login-email-input").setValue("budi@delcom.org");
  await wrapper.get("#login-password-input").setValue("rahasia");
  await wrapper.get("form").trigger("submit");
  await flushPromises();
}

describe("LoginPage", () => {
  it("menampilkan form dengan selector yang dibutuhkan grader", async () => {
    const { wrapper } = await renderWithProviders(LoginPage, { route: "/auth/login" });
    expect(wrapper.get("h1").text()).toBe("Masuk");
    expect(wrapper.find("#login-email-input").exists()).toBe(true);
    expect(wrapper.find("#login-password-input").exists()).toBe(true);
    expect(wrapper.get("#login-submit-button").text()).toBe("Masuk");
    expect(wrapper.get("a").attributes("href")).toBe("/auth/register");
  });

  it("login berhasil mengalihkan ke beranda", async () => {
    vi.mocked(loginRequest).mockResolvedValue(ok({ token: "tok", user: sampleUser }));
    const { wrapper, router } = await renderWithProviders(LoginPage, { route: "/auth/login" });
    await fillAndSubmit(wrapper);
    expect(loginRequest).toHaveBeenCalledWith("budi@delcom.org", "rahasia");
    expect(router.currentRoute.value.path).toBe("/");
    expect(showErrorDialog).not.toHaveBeenCalled();
  });

  it("login gagal menampilkan dialog error", async () => {
    vi.mocked(loginRequest).mockResolvedValue(fail("Email atau sandi salah"));
    const { wrapper, router } = await renderWithProviders(LoginPage, { route: "/auth/login" });
    await fillAndSubmit(wrapper);
    expect(showErrorDialog).toHaveBeenCalledWith("Email atau sandi salah");
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });

  it("tombol nonaktif selama proses login", async () => {
    const pending = deferred<any>();
    vi.mocked(loginRequest).mockReturnValue(pending.promise);
    const { wrapper } = await renderWithProviders(LoginPage, { route: "/auth/login" });
    await wrapper.get("form").trigger("submit");
    expect(wrapper.get("#login-submit-button").text()).toBe("Memproses...");
    expect(wrapper.get("#login-submit-button").attributes("disabled")).toBeDefined();
    pending.resolve(fail("x"));
    await flushPromises();
  });
});
