import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/vue";

// jsdom tidak punya matchMedia; dibutuhkan SweetAlert2 asli jika sampai terpanggil
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// SweetAlert2 dimock: otomatis "dikonfirmasi"
vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn(() => Promise.resolve({ isConfirmed: true })) },
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
  vi.useRealTimers();
});