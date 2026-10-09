import { mount } from "@vue/test-utils";
import { flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia, type Pinia } from "pinia";
import { createMemoryHistory, createRouter, type RouteRecordRaw } from "vue-router";
import { defineComponent, h, type Component } from "vue";

const Blank = defineComponent({ render: () => h("div", { "data-testid": "blank" }) });

export const defaultTestRoutes: RouteRecordRaw[] = [
  { path: "/:pathMatch(.*)*", component: Blank },
];

export function createMockPinia(): Pinia {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

export interface RenderOptions {
  props?: Record<string, unknown>;
  slots?: Record<string, any>;
  route?: string;
  routes?: RouteRecordRaw[];
  pinia?: Pinia;
}

export async function renderWithProviders(component: Component, options: RenderOptions = {}) {
  const pinia = options.pinia ?? createMockPinia();
  const router = createRouter({
    history: createMemoryHistory(),
    routes: options.routes ?? defaultTestRoutes,
  });
  await router.push(options.route ?? "/");
  await router.isReady();

  const wrapper = mount(component, {
    props: options.props,
    slots: options.slots,
    global: { plugins: [pinia, router] },
  });
  await flushPromises();

  return { wrapper, router, pinia };
}

export { Blank };

export const ok = (data: unknown = null, message = "Berhasil") => ({ success: true, message, data });
export const fail = (message = "Gagal") => ({ success: false, message, data: null });

export function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

export const sampleUser = {
  id: 1,
  name: "Budi Santoso",
  email: "budi@delcom.org",
  photo: null,
  created_at: "2024-02-26T02:15:53.000000Z",
  updated_at: "2024-02-26T02:15:53.000000Z",
};

export const inflowItem = {
  id: 1,
  user_id: 1,
  type: "inflow",
  source: "cash",
  label: "gaji",
  description: "Gaji bulanan",
  nominal: 1000000,
  created_at: "2024-10-05T03:00:00.000000Z",
  updated_at: "2024-10-06T03:00:00.000000Z",
};

export const outflowItem = {
  id: 2,
  user_id: 1,
  type: "outflow",
  source: "savings",
  label: "makan",
  description: "Makan siang",
  nominal: 25000,
  created_at: "2024-10-05T05:00:00.000000Z",
  updated_at: "2024-10-05T05:00:00.000000Z",
};

export const rawStats = {
  cashflow: 975000,
  total_inflow: 1000000,
  total_outflow: 25000,
  total_inflow_cash: 1000000,
  total_outflow_savings: 25000,
};
