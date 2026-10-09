import { beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import {
  formatDateTime,
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  toApiDateTime,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

beforeEach(() => {
  vi.mocked(Swal.fire).mockReset();
});

describe("dialog helpers", () => {
  it("showSuccessDialog menampilkan dialog sukses", async () => {
    vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as any);
    await showSuccessDialog("Tersimpan");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success", text: "Tersimpan" }));
  });

  it("showErrorDialog menampilkan dialog error", async () => {
    vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as any);
    await showErrorDialog("Gagal");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "error", text: "Gagal" }));
  });

  it("showConfirmDialog mengembalikan true jika dikonfirmasi", async () => {
    vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as any);
    await expect(showConfirmDialog("Yakin?", "Ya")).resolves.toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ showCancelButton: true, confirmButtonText: "Ya" })
    );
  });

  it("showConfirmDialog mengembalikan false jika dibatalkan", async () => {
    vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: false } as any);
    await expect(showConfirmDialog("Yakin?", "Ya")).resolves.toBe(false);
  });
});

describe("formatRupiah", () => {
  it("memformat angka dan string numerik", () => {
    expect(formatRupiah(15000)).toMatch(/Rp\s15\.000/);
    expect(formatRupiah("2500")).toMatch(/Rp\s2\.500/);
  });

  it("nilai tidak valid dianggap 0", () => {
    expect(formatRupiah("abc")).toMatch(/Rp\s0/);
  });
});

describe("formatDateTime", () => {
  it("mengembalikan '-' untuk nilai kosong", () => {
    expect(formatDateTime(null)).toBe("-");
    expect(formatDateTime(undefined)).toBe("-");
    expect(formatDateTime("")).toBe("-");
  });

  it("mengembalikan nilai asli jika bukan tanggal valid", () => {
    expect(formatDateTime("bukan-tanggal")).toBe("bukan-tanggal");
  });

  it("memformat tanggal valid ke zona Asia/Jakarta", () => {
    const text = formatDateTime("2024-10-05T10:30:00.000000Z");
    expect(text).toMatch(/2024/);
    expect(text).toMatch(/17[.:]30/);
  });
});

describe("toApiDateTime", () => {
  it("string kosong tetap kosong", () => {
    expect(toApiDateTime("", false)).toBe("");
  });

  it("menambahkan jam awal dan akhir hari", () => {
    expect(toApiDateTime("2024-10-05", false)).toBe("2024-10-05 00:00:00");
    expect(toApiDateTime("2024-10-05", true)).toBe("2024-10-05 23:59:59");
  });
});
