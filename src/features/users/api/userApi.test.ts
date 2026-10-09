import { beforeEach, describe, expect, it, vi } from "vitest";
import { changePassword, getMe, getUsers, updateMe, uploadPhoto } from "./userApi";
import { apiRequest } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ apiRequest: vi.fn() }));

beforeEach(() => {
  vi.mocked(apiRequest).mockReset();
  vi.mocked(apiRequest).mockResolvedValue({ success: true, message: "ok", data: null });
});

describe("userApi", () => {
  it("getUsers dan getMe", async () => {
    await getUsers();
    await getMe();
    expect(apiRequest).toHaveBeenNthCalledWith(1, "/users");
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/users/me");
  });

  it("updateMe memakai PUT /users/me", async () => {
    await updateMe("Budi", "b@d.c");
    expect(apiRequest).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: { name: "Budi", email: "b@d.c" },
    });
  });

  it("uploadPhoto mengirim FormData field photo", async () => {
    const file = new File(["x"], "a.png", { type: "image/png" });
    await uploadPhoto(file);
    const [path, options] = vi.mocked(apiRequest).mock.calls[0] as any;
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("photo")).toBeInstanceOf(File);
  });

  it("changePassword memakai PUT /users/password", async () => {
    await changePassword("lama", "baru", "baru");
    expect(apiRequest).toHaveBeenCalledWith("/users/password", {
      method: "PUT",
      body: { password: "lama", new_password: "baru", new_password_confirmation: "baru" },
    });
  });
});
