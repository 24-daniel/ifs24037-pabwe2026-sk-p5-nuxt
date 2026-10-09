import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import routerOptions from "./router.options";
import { routes } from "./routes";

function makeRouter() {
  return createRouter({ history: createMemoryHistory(), routes: routerOptions.routes() });
}

describe("router.options & routes", () => {
  it("router.options mengembalikan rute dari routes.ts", () => {
    expect(routerOptions.routes()).toBe(routes);
  });

  it("mendefinisikan rute auth, dashboard, dan wildcard", async () => {
    const router = makeRouter();

    await router.push("/auth/login");
    expect(router.currentRoute.value.name).toBe("login");

    await router.push("/auth/register");
    expect(router.currentRoute.value.name).toBe("register");

    await router.push("/auth");
    expect(router.currentRoute.value.path).toBe("/auth/login");

    await router.push("/");
    expect(router.currentRoute.value.name).toBe("home");

    await router.push("/cash-flows/5");
    expect(router.currentRoute.value.name).toBe("cash-flow-detail");
    expect(router.currentRoute.value.params.cashFlowId).toBe("5");

    await router.push("/users");
    expect(router.currentRoute.value.name).toBe("users");

    await router.push("/profile");
    expect(router.currentRoute.value.name).toBe("profile");

    await router.push("/tidak-ada/sama-sekali");
    expect(router.currentRoute.value.name).toBe("not-found");
  });
});
