import { createPinia, setActivePinia, type Pinia } from "pinia";
import { createMemoryHistory, createRouter, type RouteRecordRaw } from "vue-router";
import { defineComponent, h, type Component } from "vue";
import { render } from "@testing-library/vue";
import type { CashFlow } from "./features/cashflows/states/cashFlowsStore";

export const Blank = defineComponent({ render: () => h("div", { "data-testid": "blank" }) });

/** Pinia baru untuk pengujian; initialState mengisi state awal tiap store. */
export function createMockPinia(initialState: Record<string, unknown> = {}): Pinia {
  const pinia = createPinia();
  pinia.state.value = initialState as never;
  setActivePinia(pinia);
  return pinia;
}

interface ProviderOptions {
  route?: string;
  initialState?: Record<string, unknown>;
  routes?: RouteRecordRaw[];
  props?: Record<string, unknown>;
  slots?: Record<string, unknown>;
}

/**
 * Render komponen dengan Pinia + router (memory history).
 * routes default: semua path dirender sebagai komponen kosong.
 */
export async function renderWithProviders(
  component: Component,
  {
    route = "/",
    initialState = {},
    routes = [{ path: "/:pathMatch(.*)*", component: Blank }],
    props,
    slots,
  }: ProviderOptions = {},
) {
  const pinia = createMockPinia(initialState);
  const router = createRouter({ history: createMemoryHistory(), routes });
  router.push(route);
  await router.isReady();
  const utils = render(component, { props, slots, global: { plugins: [pinia, router] } } as never);
  return { ...utils, pinia, router };
}

/** Data contoh transaksi arus kas. */
export const makeCashFlow = (overrides: Partial<CashFlow> = {}): CashFlow => ({
  id: 1,
  user_id: 1,
  type: "outflow",
  source: "cash",
  label: "alat-mandi",
  description: "Membeli sabun dan odol",
  nominal: 100000,
  created_at: "2024-10-05T11:28:02.000000Z",
  updated_at: "2024-10-06T11:28:02.000000Z",
  ...overrides,
});

export const deferred = <T = unknown>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};
