import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest, getAccessToken, putAccessToken, removeAccessToken } from "./apiHelper";

function mockFetch(json: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({ json: async () => json });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("token storage", () => {
  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe("apiRequest", () => {
  it("GET dengan query (nilai kosong diabaikan) dan token Bearer", async () => {
    putAccessToken("tok");
    const fetchMock = mockFetch({ status: "success", message: "ok", data: { a: 1 } });

    const result = await apiRequest("/cash-flows", {
      query: { type: "inflow", limit: 5, label: "", a: null, b: undefined },
    });

    const [url, init] = fetchMock.mock.calls[0];
    const parsed = new URL(url);
    expect(parsed.pathname.endsWith("/cash-flows")).toBe(true);
    expect(parsed.searchParams.get("type")).toBe("inflow");
    expect(parsed.searchParams.get("limit")).toBe("5");
    expect(parsed.searchParams.has("label")).toBe(false);
    expect(parsed.searchParams.has("a")).toBe(false);
    expect(parsed.searchParams.has("b")).toBe(false);
    expect(init.method).toBe("GET");
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(init.body).toBeUndefined();
    expect(result).toEqual({ success: true, message: "ok", data: { a: 1 } });
  });

  it("tanpa token tidak mengirim header Authorization", async () => {
    const fetchMock = mockFetch({ status: "success", message: "ok", data: {} });
    await apiRequest("/users");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("auth:false tidak mengirim token meskipun tersimpan", async () => {
    putAccessToken("tok");
    const fetchMock = mockFetch({ status: "success", message: "ok" });
    await apiRequest("/auth/login", { method: "POST", body: { a: 1 }, auth: false });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("mengirim body JSON dengan Content-Type", async () => {
    const fetchMock = mockFetch({ status: "success", message: "ok" });
    await apiRequest("/cash-flows", { method: "POST", body: { label: "x" } });
    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ label: "x" }));
  });

  it("mengirim FormData apa adanya tanpa Content-Type", async () => {
    const fetchMock = mockFetch({ status: "success", message: "ok" });
    const form = new FormData();
    form.append("photo", new File(["x"], "a.png"));
    await apiRequest("/users/me/photo", { method: "POST", body: form });
    const init = fetchMock.mock.calls[0][1];
    expect(init.body).toBe(form);
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("respons gagal menghasilkan success=false dan data null", async () => {
    mockFetch({ status: "fail", message: "Data tidak valid" });
    const result = await apiRequest("/auth/login");
    expect(result).toEqual({ success: false, message: "Data tidak valid", data: null });
  });

  it("menangani error jaringan bertipe Error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network down")));
    const result = await apiRequest("/users");
    expect(result).toEqual({ success: false, message: "Network down", data: null });
  });

  it("menangani error non-Error dengan pesan default", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue("boom"));
    const result = await apiRequest("/users");
    expect(result.message).toBe("Terjadi kesalahan jaringan");
    expect(result.success).toBe(false);
  });
});
