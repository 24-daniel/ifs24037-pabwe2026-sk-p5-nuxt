// @ts-nocheck
import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/vue";
import SidebarComponent from "./SidebarComponent.vue";
import { renderWithProviders } from "../../../test-utils";

const link = (name) => screen.getByRole("link", { name });

describe("SidebarComponent", () => {
  it("menampilkan tiga menu navigasi", async () => {
    await renderWithProviders(SidebarComponent);
    expect(link("Ringkasan Arus Kas")).toHaveAttribute("href", "/");
    expect(link("Direktori Pengguna")).toHaveAttribute("href", "/users");
    expect(link("Profil Saya")).toHaveAttribute("href", "/profile");
  });

  it.each([
    ["/", "Ringkasan Arus Kas"],
    ["/cash-flows/3", "Ringkasan Arus Kas"],
    ["/users", "Direktori Pengguna"],
    ["/profile", "Profil Saya"],
  ])("menandai menu aktif untuk %s", async (route, active) => {
    await renderWithProviders(SidebarComponent, { route });
    expect(link(active)).toHaveClass("bg-white");
    screen
      .getAllByRole("link")
      .filter((el) => el !== link(active))
      .forEach((el) => expect(el).not.toHaveClass("bg-white"));
  });

  it("drawer tertutup secara default dan tanpa backdrop", async () => {
    await renderWithProviders(SidebarComponent);
    expect(screen.getByLabelText("Navigasi utama")).toHaveClass("-translate-x-full");
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });

  it("drawer terbuka: backdrop, tombol tutup, dan klik menu memicu close", async () => {
    const { emitted } = await renderWithProviders(SidebarComponent, { props: { open: true } });
    expect(screen.getByLabelText("Navigasi utama")).toHaveClass("translate-x-0");
    await fireEvent.click(screen.getByTestId("sidebar-backdrop"));
    await fireEvent.click(screen.getByLabelText("Tutup menu"));
    await fireEvent.click(link("Profil Saya"));
    expect(emitted().close).toHaveLength(3);
  });
});
