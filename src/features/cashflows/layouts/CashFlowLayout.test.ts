import { beforeEach, describe, expect, it, vi } from "vitest";
import CashFlowLayout from "./CashFlowLayout.vue";
import { getMe } from "../../users/api/userApi";
import { putAccessToken } from "../../../helpers/apiHelper";
import { ok, renderWithProviders, sampleUser } from "../../../test-utils";

vi.mock("../../users/api/userApi");

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getMe).mockResolvedValue(ok({ user: sampleUser }));
});

describe("CashFlowLayout", () => {
  it("tamu dialihkan ke halaman login dan konten tidak dirender", async () => {
    const { wrapper, router } = await renderWithProviders(CashFlowLayout, { route: "/" });
    expect(router.currentRoute.value.path).toBe("/auth/login");
    expect(wrapper.find("main").exists()).toBe(false);
    expect(getMe).not.toHaveBeenCalled();
  });

  it("pengguna login melihat navbar, sidebar, dan konten", async () => {
    putAccessToken("tok");
    const { wrapper, router } = await renderWithProviders(CashFlowLayout, { route: "/" });
    expect(router.currentRoute.value.path).toBe("/");
    expect(wrapper.find("aside").exists()).toBe(true);
    expect(wrapper.find("header").exists()).toBe(true);
    expect(wrapper.find("main [data-testid='blank']").exists()).toBe(true);
  });

  it("tombol menu membuka dan backdrop menutup sidebar", async () => {
    putAccessToken("tok");
    const { wrapper } = await renderWithProviders(CashFlowLayout, { route: "/" });
    expect(wrapper.find("button[aria-label='Tutup menu navigasi']").exists()).toBe(false);
    await wrapper.get("button[aria-label='Buka menu navigasi']").trigger("click");
    expect(wrapper.find("button[aria-label='Tutup menu navigasi']").exists()).toBe(true);
    await wrapper.get("button[aria-label='Tutup menu navigasi']").trigger("click");
    expect(wrapper.find("button[aria-label='Tutup menu navigasi']").exists()).toBe(false);
  });
});
