import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useUsersStore } from "./usersStore";
import { changePassword, getMe, getUsers, updateMe, uploadPhoto } from "../api/userApi";
import { fail, ok, sampleUser } from "../../../test-utils";

vi.mock("../api/userApi");

beforeEach(() => {
  [getUsers, getMe, updateMe, uploadPhoto, changePassword].forEach((fn) => vi.mocked(fn as any).mockReset());
  setActivePinia(createPinia());
});

describe("usersStore", () => {
  it("fetchUsers berhasil dan gagal", async () => {
    const store = useUsersStore();
    vi.mocked(getUsers).mockResolvedValue(ok({ users: [sampleUser] }));
    await store.fetchUsers();
    expect(store.users).toEqual([sampleUser]);
    expect(store.isLoading).toBe(false);

    vi.mocked(getUsers).mockResolvedValue(fail());
    await store.fetchUsers();
    expect(store.users).toEqual([]);
  });

  it("fetchProfile berhasil dan gagal", async () => {
    const store = useUsersStore();
    vi.mocked(getMe).mockResolvedValue(ok({ user: sampleUser }));
    await store.fetchProfile();
    expect(store.profile).toEqual(sampleUser);

    vi.mocked(getMe).mockResolvedValue(fail());
    await store.fetchProfile();
    expect(store.profile).toBeNull();
  });

  it("updateProfile memperbarui profil hanya jika berhasil", async () => {
    const store = useUsersStore();
    const updated = { ...sampleUser, name: "Baru" };
    vi.mocked(updateMe).mockResolvedValue(ok({ user: updated }));
    await store.updateProfile("Baru", sampleUser.email);
    expect(store.profile).toEqual(updated);
    expect(store.isSaving).toBe(false);

    vi.mocked(updateMe).mockResolvedValue(fail());
    await store.updateProfile("Lain", sampleUser.email);
    expect(store.profile).toEqual(updated);
  });

  it("changePhoto dan changePassword meneruskan hasil API", async () => {
    const store = useUsersStore();
    const file = new File(["x"], "a.png");
    vi.mocked(uploadPhoto).mockResolvedValue(ok(null, "foto ok"));
    vi.mocked(changePassword).mockResolvedValue(ok(null, "sandi ok"));

    await expect(store.changePhoto(file)).resolves.toMatchObject({ message: "foto ok" });
    await expect(store.changePassword("a", "b", "b")).resolves.toMatchObject({ message: "sandi ok" });
    expect(uploadPhoto).toHaveBeenCalledWith(file);
    expect(changePassword).toHaveBeenCalledWith("a", "b", "b");
    expect(store.isSaving).toBe(false);
  });
});
