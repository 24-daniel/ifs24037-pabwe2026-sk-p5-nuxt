import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import NavbarComponent from "./NavbarComponent.vue";
import { getMe } from "../../users/api/userApi";
import { useUsersStore } from "../../users/states/usersStore";
import { useAuthStore } from "../../auth/states/authStore";
import { putAccessToken } from "../../../helpers/apiHelper";
import { createMockPinia, deferred, ok, renderWithProviders, sampleUser } from "../../../test-utils";

vi.mock("../../users/api/userApi");

beforeEach(() => {
  vi.resetAllMocks();
});

describe("NavbarComponent", () => {
  it("memuat profil dan menampilkan nama serta username", async () => {
    vi.mocked(getMe).mockResolvedValue(ok({ user: sampleUser }));
    const { wrapper } = await renderWithProviders(NavbarComponent);
    expect(getMe).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain("Budi Santoso");
    expect(wrapper.text()).toContain("budi@delcom.org");
    expect(wrapper.text()).toContain("Sesi aktif");
  });

  it("menampilkan placeholder saat profil belum tersedia", async () => {
    const pending = deferred<any>();
    vi.mocked(getMe).mockReturnValue(pending.promise);
    const { wrapper } = await renderWithProviders(NavbarComponent);
    expect(wrapper.text()).toContain("Memuat...");
    pending.resolve(ok({ user: sampleUser }));
    await flushPromises();
    expect(wrapper.text()).toContain("Budi Santoso");
  });

  it("tidak memuat ulang profil yang sudah ada di store", async () => {
    const pinia = createMockPinia();
    useUsersStore(pinia).profile = sampleUser;
    const { wrapper } = await renderWithProviders(NavbarComponent, { pinia });
    expect(getMe).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Budi Santoso");
  });

  it("tombol menu memicu event toggle-sidebar", async () => {
    vi.mocked(getMe).mockResolvedValue(ok({ user: sampleUser }));
    const { wrapper } = await renderWithProviders(NavbarComponent);
    await wrapper.get("button[aria-label='Buka menu navigasi']").trigger("click");
    expect(wrapper.emitted("toggle-sidebar")).toHaveLength(1);
  });

  it("keluar menghapus sesi dan mengarah ke login", async () => {
    putAccessToken("tok");
    vi.mocked(getMe).mockResolvedValue(ok({ user: sampleUser }));
    const { wrapper, router, pinia } = await renderWithProviders(NavbarComponent, { route: "/" });
    const buttons = wrapper.findAll("button");
    await buttons[buttons.length - 1].trigger("click");
    await flushPromises();
    expect(useAuthStore(pinia).token).toBeNull();
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });
});
