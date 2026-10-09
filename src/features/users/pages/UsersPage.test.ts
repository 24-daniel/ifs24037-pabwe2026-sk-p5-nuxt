import { beforeEach, describe, expect, it, vi } from "vitest";
import UsersPage from "./UsersPage.vue";
import { getUsers } from "../api/userApi";
import { fail, ok, renderWithProviders, sampleUser } from "../../../test-utils";

vi.mock("../api/userApi");

beforeEach(() => {
  vi.resetAllMocks();
});

describe("UsersPage", () => {
  it("menampilkan daftar pengguna dengan foto atau inisial", async () => {
    vi.mocked(getUsers).mockResolvedValue(
      ok({
        users: [sampleUser, { ...sampleUser, id: 2, name: "Ani", email: "ani@delcom.org", photo: "https://x.test/a.png" }],
      })
    );
    const { wrapper } = await renderWithProviders(UsersPage);
    expect(getUsers).toHaveBeenCalledTimes(1);
    const items = wrapper.findAll("li");
    expect(items).toHaveLength(2);
    expect(items[0].text()).toContain("Budi Santoso");
    expect(items[0].text()).toContain("B");
    expect(items[0].find("img").exists()).toBe(false);
    expect(items[1].get("img").attributes("alt")).toBe("Foto Ani");
  });

  it("menampilkan status memuat", async () => {
    vi.mocked(getUsers).mockReturnValue(new Promise(() => {}));
    const { wrapper } = await renderWithProviders(UsersPage);
    expect(wrapper.text()).toContain("Memuat data...");
  });

  it("menampilkan keadaan kosong", async () => {
    vi.mocked(getUsers).mockResolvedValue(fail());
    const { wrapper } = await renderWithProviders(UsersPage);
    expect(wrapper.text()).toContain("Belum ada pengguna.");
  });
});
