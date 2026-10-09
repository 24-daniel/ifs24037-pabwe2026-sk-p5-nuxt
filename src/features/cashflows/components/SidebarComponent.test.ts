import { describe, expect, it } from "vitest";
import SidebarComponent from "./SidebarComponent.vue";
import { renderWithProviders } from "../../../test-utils";

describe("SidebarComponent", () => {
  it("menampilkan tiga menu dan menandai menu aktif", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, {
      props: { open: false },
      route: "/",
    });
    const links = wrapper.findAll("nav a");
    expect(links.map((l) => l.text())).toEqual(["Ringkasan Arus Kas", "Direktori Pengguna", "Profil Saya"]);
    expect(links.map((l) => l.attributes("href"))).toEqual(["/", "/users", "/profile"]);
    expect(links[0].attributes("aria-current")).toBe("page");
    expect(links[1].attributes("aria-current")).toBeUndefined();
    expect(wrapper.get("aside").classes()).toContain("-translate-x-full");
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("saat terbuka menampilkan backdrop yang menutup sidebar", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: true } });
    expect(wrapper.get("aside").classes()).toContain("translate-x-0");
    await wrapper.get("button[aria-label='Tutup menu navigasi']").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("klik menu bernavigasi dan menutup sidebar", async () => {
    const { wrapper, router } = await renderWithProviders(SidebarComponent, { props: { open: true } });
    await wrapper.findAll("nav a")[1].trigger("click");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(router.currentRoute.value.path).toBe("/users");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});
