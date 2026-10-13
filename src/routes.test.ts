// @ts-nocheck
import { beforeEach, describe, expect, it } from "vitest";
import { createMemoryHistory } from "vue-router";
import routesDefault, { requireAuth, requireGuest, routes } from "./routes";
import { createAppRouter } from "./router";
import NotFoundPage from "./features/common/pages/NotFoundPage.vue";
import { putAccessToken } from "./helpers/apiHelper";

const go = async (path, token = false) => {
  if (token) putAccessToken("TOK");
  const router = createAppRouter(createMemoryHistory());
  await router.push(path);
  await router.isReady();
  return router.currentRoute.value;
};

describe("guard", () => {
  it("requireAuth", () => {
    expect(requireAuth()).toBe("/auth/login");
    putAccessToken("TOK");
    expect(requireAuth()).toBe(true);
  });

  it("requireGuest", () => {
    expect(requireGuest()).toBe(true);
    putAccessToken("TOK");
    expect(requireGuest()).toBe("/");
  });
});

describe("routes & router", () => {
  beforeEach(() => localStorage.clear());

  it("mendeklarasikan rute auth, dashboard arus kas, dan wildcard", () => {
    expect(routesDefault).toBe(routes);
    expect(routes.map((r) => r.path)).toEqual(["/auth", "/", "/:pathMatch(.*)*"]);
    expect(routes[0].children.map((r) => r.path)).toEqual(["login", "register"]);
    expect(routes[1].children.map((r) => r.path)).toEqual(["", "cash-flows/:cashFlowId", "users", "profile"]);
  });

  it("tanpa token, halaman dashboard diarahkan ke login", async () => {
    expect((await go("/")).path).toBe("/auth/login");
    expect((await go("/users")).path).toBe("/auth/login");
  });

  it("/auth diarahkan ke login dan register dapat diakses tamu", async () => {
    expect((await go("/auth")).path).toBe("/auth/login");
    expect((await go("/auth/register")).path).toBe("/auth/register");
  });

  it("dengan token, dashboard dapat diakses dan halaman auth ditolak", async () => {
    expect((await go("/cash-flows/3", true)).params.cashFlowId).toBe("3");
    expect((await go("/profile", true)).path).toBe("/profile");
    expect((await go("/auth/login", true)).path).toBe("/");
  });

  it("semua halaman lazy ter-resolve saat dikunjungi", async () => {
    expect((await go("/", true)).matched).toHaveLength(2);
    expect((await go("/users", true)).path).toBe("/users");
    expect((await go("/cash-flows/9", true)).path).toBe("/cash-flows/9");
    expect((await go("/profile", true)).path).toBe("/profile");
    localStorage.clear();
    expect((await go("/auth/login")).path).toBe("/auth/login");
    expect((await go("/auth/register")).path).toBe("/auth/register");
  });

  it("rute tidak dikenal memakai NotFoundPage", async () => {
    const route = await go("/halaman/tidak/ada");
    expect(route.matched[0].components.default).toBe(NotFoundPage);
  });
});
