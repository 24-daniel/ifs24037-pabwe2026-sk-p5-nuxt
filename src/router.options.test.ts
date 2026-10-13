// @ts-nocheck
import { describe, expect, it } from "vitest";
import routerOptions from "./router.options";
import { routes } from "./routes";

describe("router.options", () => {
  it("menyuplai rute kustom dari routes.ts ke Nuxt", () => {
    expect(routerOptions.routes()).toBe(routes);
  });
});
