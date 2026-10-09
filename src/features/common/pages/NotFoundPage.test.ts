import { describe, expect, it } from "vitest";
import NotFoundPage from "./NotFoundPage.vue";
import { renderWithProviders } from "../../../test-utils";

describe("NotFoundPage", () => {
  it("menampilkan 404 dan tautan kembali", async () => {
    const { wrapper } = await renderWithProviders(NotFoundPage);
    expect(wrapper.get("h1").text()).toBe("Halaman tidak ditemukan");
    expect(wrapper.text()).toContain("404");
    expect(wrapper.get("a").attributes("href")).toBe("/");
  });
});
