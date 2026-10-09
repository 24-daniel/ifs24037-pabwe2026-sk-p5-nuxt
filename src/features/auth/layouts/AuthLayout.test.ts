import { describe, expect, it } from "vitest";
import AuthLayout from "./AuthLayout.vue";
import { putAccessToken } from "../../../helpers/apiHelper";
import { renderWithProviders } from "../../../test-utils";

describe("AuthLayout", () => {
  it("menampilkan merek dan konten rute untuk tamu", async () => {
    const { wrapper, router } = await renderWithProviders(AuthLayout, { route: "/auth/login" });
    expect(wrapper.text()).toContain("Delcom Cash Flow");
    expect(wrapper.find("main").exists()).toBe(true);
    expect(wrapper.find("[data-testid='blank']").exists()).toBe(true);
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });

  it("mengalihkan pengguna yang sudah login ke beranda", async () => {
    putAccessToken("tok");
    const { router } = await renderWithProviders(AuthLayout, { route: "/auth/login" });
    expect(router.currentRoute.value.path).toBe("/");
  });
});
