import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginRequest, registerRequest } from "./authApi";
import { apiRequest } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ apiRequest: vi.fn() }));

beforeEach(() => {
  vi.mocked(apiRequest).mockReset();
  vi.mocked(apiRequest).mockResolvedValue({ success: true, message: "ok", data: null });
});

describe("authApi", () => {
  it("loginRequest memanggil POST /auth/login tanpa token", async () => {
    await loginRequest("a@b.c", "rahasia");
    expect(apiRequest).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "a@b.c", password: "rahasia" },
      auth: false,
    });
  });

  it("registerRequest memanggil POST /auth/register tanpa token", async () => {
    await registerRequest("Budi", "a@b.c", "rahasia");
    expect(apiRequest).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: { name: "Budi", email: "a@b.c", password: "rahasia" },
      auth: false,
    });
  });
});
