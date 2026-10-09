import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "./authStore";
import { loginRequest, registerRequest } from "../api/authApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { deferred, fail, ok, sampleUser } from "../../../test-utils";

vi.mock("../api/authApi");

beforeEach(() => {
  vi.mocked(loginRequest).mockReset();
  vi.mocked(registerRequest).mockReset();
  setActivePinia(createPinia());
});

describe("authStore", () => {
  it("state awal tanpa token", () => {
    const store = useAuthStore();
    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(store.isLoading).toBe(false);
    expect(store.isAuthenticated).toBe(false);
  });

  it("membaca token tersimpan", () => {
    putAccessToken("saved");
    setActivePinia(createPinia());
    const store = useAuthStore();
    expect(store.token).toBe("saved");
    expect(store.isAuthenticated).toBe(true);
  });

  it("login berhasil menyimpan token dan user", async () => {
    vi.mocked(loginRequest).mockResolvedValue(ok({ token: "tok", user: sampleUser }, "Berhasil login"));
    const store = useAuthStore();
    const result = await store.login("a@b.c", "x");
    expect(result).toEqual({ success: true, message: "Berhasil login" });
    expect(store.token).toBe("tok");
    expect(store.user).toEqual(sampleUser);
    expect(getAccessToken()).toBe("tok");
    expect(store.isLoading).toBe(false);
  });

  it("login gagal tidak mengubah sesi", async () => {
    vi.mocked(loginRequest).mockResolvedValue(fail("Email salah"));
    const store = useAuthStore();
    const result = await store.login("a@b.c", "x");
    expect(result).toEqual({ success: false, message: "Email salah" });
    expect(store.token).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it("isLoading true selama login berjalan", async () => {
    const pending = deferred<any>();
    vi.mocked(loginRequest).mockReturnValue(pending.promise);
    const store = useAuthStore();
    const promise = store.login("a@b.c", "x");
    expect(store.isLoading).toBe(true);
    pending.resolve(fail("x"));
    await promise;
    expect(store.isLoading).toBe(false);
  });

  it("register mengembalikan hasil API", async () => {
    vi.mocked(registerRequest).mockResolvedValue(ok(null, "Berhasil mendaftar"));
    const store = useAuthStore();
    await expect(store.register("Budi", "a@b.c", "x")).resolves.toEqual({
      success: true,
      message: "Berhasil mendaftar",
    });
    expect(registerRequest).toHaveBeenCalledWith("Budi", "a@b.c", "x");
    expect(store.isLoading).toBe(false);
  });

  it("logout menghapus sesi", async () => {
    vi.mocked(loginRequest).mockResolvedValue(ok({ token: "tok", user: sampleUser }));
    const store = useAuthStore();
    await store.login("a@b.c", "x");
    store.logout();
    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(getAccessToken()).toBeNull();
  });
});
