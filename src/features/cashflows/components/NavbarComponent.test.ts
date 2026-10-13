// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/vue";
import Swal from "sweetalert2";
import NavbarComponent from "./NavbarComponent.vue";
import * as authApi from "../../auth/api/authApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../../auth/api/authApi");

const profile = { id: 1, name: "Abdullah Ubaid", email: "ifs18005@del.ac.id", photo: "img/profile/1.png" };
const withProfile = { users: { profile } };

describe("NavbarComponent", () => {
  beforeEach(() => authApi.logout.mockResolvedValue({ status: "success" }));

  it("menampilkan nama, email, status sesi, dan foto profil", async () => {
    const { container } = await renderWithProviders(NavbarComponent, { initialState: withProfile });
    expect(screen.getByText("Abdullah Ubaid")).toBeInTheDocument();
    expect(screen.getByText("ifs18005@del.ac.id")).toBeInTheDocument();
    expect(screen.getByText("Sesi aktif")).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute("src", "https://open-api.delcom.org/img/profile/1.png");
  });

  it("tanpa foto: inisial; tanpa profil: nama Pengguna", async () => {
    const { unmount } = await renderWithProviders(NavbarComponent, {
      initialState: { users: { profile: { ...profile, photo: "" } } },
    });
    expect(screen.getByText("AU")).toBeInTheDocument();
    unmount();
    await renderWithProviders(NavbarComponent);
    expect(screen.getByText("Pengguna")).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("foto bawaan API (img/user.png) tidak diunduh: tampil inisial", async () => {
    const { container } = await renderWithProviders(NavbarComponent, {
      initialState: { users: { profile: { ...profile, photo: "img/user.png" } } },
    });
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("AU")).toBeInTheDocument();
  });

  it("tombol menu mengirim event toggle-sidebar", async () => {
    const { emitted } = await renderWithProviders(NavbarComponent);
    await fireEvent.click(screen.getByLabelText("Buka menu"));
    expect(emitted()["toggle-sidebar"]).toHaveLength(1);
  });

  it("logout terkonfirmasi menghapus sesi dan menuju halaman login", async () => {
    putAccessToken("TOK");
    const { router } = await renderWithProviders(NavbarComponent, { initialState: withProfile });
    await fireEvent.click(screen.getByRole("button", { name: /keluar/i }));
    await waitFor(() => expect(router.currentRoute.value.path).toBe("/auth/login"));
    expect(authApi.logout).toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
  });

  it("logout dibatalkan tidak melakukan apa pun", async () => {
    putAccessToken("TOK");
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    const { router } = await renderWithProviders(NavbarComponent, { initialState: withProfile });
    await fireEvent.click(screen.getByRole("button", { name: /keluar/i }));
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
    expect(authApi.logout).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe("TOK");
    expect(router.currentRoute.value.path).toBe("/");
  });
});
