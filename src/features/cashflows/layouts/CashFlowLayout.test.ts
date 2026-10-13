// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/vue";
import CashFlowLayout from "./CashFlowLayout.vue";
import * as userApi from "../../users/api/userApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../../users/api/userApi");

describe("CashFlowLayout", () => {
  beforeEach(() =>
    userApi.getProfile.mockResolvedValue({
      status: "success",
      data: { user: { id: 1, name: "Abdullah Ubaid", email: "a@b.co", photo: "" } },
    }),
  );

  it("menyusun sidebar, navbar, dan konten rute, serta memuat profil", async () => {
    await renderWithProviders(CashFlowLayout);
    expect(screen.getByLabelText("Navigasi utama")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByTestId("blank")).toBeInTheDocument();
    expect(await screen.findByText("Abdullah Ubaid")).toBeInTheDocument();
    expect(userApi.getProfile).toHaveBeenCalledTimes(1);
  });

  it("token tidak valid (401) mengembalikan pengguna ke halaman login", async () => {
    putAccessToken("kedaluwarsa");
    userApi.getProfile.mockResolvedValue({ status: "fail", message: "Unauthenticated.", httpStatus: 401 });
    const { router } = await renderWithProviders(CashFlowLayout);
    await waitFor(() => expect(router.currentRoute.value.path).toBe("/auth/login"));
    expect(getAccessToken()).toBeNull();
  });

  it("kegagalan lain tidak mengalihkan halaman", async () => {
    userApi.getProfile.mockResolvedValue({ status: "fail", message: "Server error", httpStatus: 500 });
    const { router } = await renderWithProviders(CashFlowLayout);
    await waitFor(() => expect(userApi.getProfile).toHaveBeenCalled());
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("tombol menu membuka dan backdrop menutup sidebar", async () => {
    await renderWithProviders(CashFlowLayout);
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
    await fireEvent.click(screen.getByLabelText("Buka menu"));
    await fireEvent.click(screen.getByTestId("sidebar-backdrop"));
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });
});
