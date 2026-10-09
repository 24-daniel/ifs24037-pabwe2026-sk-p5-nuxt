import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import App from "./App.vue";
import { renderWithProviders } from "./test-utils";

const Probe = defineComponent({ render: () => h("p", "isi halaman") });

describe("App", () => {
  it("merender rute aktif lewat RouterView", async () => {
    const { wrapper } = await renderWithProviders(App, {
      route: "/",
      routes: [{ path: "/", component: Probe }],
    });
    expect(wrapper.text()).toContain("isi halaman");
  });
});
