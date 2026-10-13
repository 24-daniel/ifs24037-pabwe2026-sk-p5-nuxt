// @ts-nocheck
import { describe, expect, it } from "vitest";
import Swal from "sweetalert2";
import {
  cn,
  extractErrorMessage,
  formatDate,
  formatDateOnly,
  formatRupiah,
  getInitials,
  isValidEmail,
  parseTimestamp,
  resolveImageUrl,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  toApiDate,
  validateCashFlowForm,
} from "./toolsHelper";

describe("dialog SweetAlert2", () => {
  it("showSuccessDialog & showErrorDialog memakai judul default atau kustom", async () => {
    await showSuccessDialog("ok");
    await showSuccessDialog("ok", "Judul");
    await showErrorDialog("gagal");
    await showErrorDialog("gagal", "Judul");
    const calls = Swal.fire.mock.calls.map(([o]) => [o.icon, o.title]);
    expect(calls).toEqual([
      ["success", "Berhasil"],
      ["success", "Judul"],
      ["error", "Terjadi kesalahan"],
      ["error", "Judul"],
    ]);
  });

  it("showConfirmDialog mengembalikan hasil konfirmasi", async () => {
    expect(await showConfirmDialog("hapus?")).toBe(true);
    expect(Swal.fire.mock.calls[0][0].title).toBe("Apakah kamu yakin?");
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    expect(await showConfirmDialog("hapus?", "Judul")).toBe(false);
    expect(Swal.fire.mock.calls[1][0].title).toBe("Judul");
  });
});

describe("format", () => {
  it("cn menggabungkan dan me-merge class Tailwind", () => {
    expect(cn("px-2 py-1", false && "hidden", "px-4")).toBe("py-1 px-4");
  });

  it("formatRupiah", () => {
    expect(formatRupiah(10000)).toMatch(/Rp\s?10\.000/);
    expect(formatRupiah("abc")).toMatch(/Rp\s?0/);
    expect(formatRupiah(undefined)).toMatch(/Rp\s?0/);
  });

  it("parseTimestamp menerima format API dan ISO", () => {
    expect(parseTimestamp(null)).toBeNull();
    expect(parseTimestamp("bukan tanggal")).toBeNull();
    expect(parseTimestamp("2024-10-05 22:00:00").getHours()).toBe(22);
    expect(parseTimestamp("2024-10-05T08:34:04.000000Z")).toBeInstanceOf(Date);
  });

  it("formatDate & formatDateOnly", () => {
    expect(formatDate(undefined)).toBe("-");
    expect(formatDate("2024-10-05 22:00:00")).toMatch(/2024/);
    expect(formatDateOnly(null)).toBe("-");
    expect(formatDateOnly("2024-10-05 22:00:00")).toMatch(/2024/);
    expect(formatDateOnly("2024-10-05 22:00:00")).not.toMatch(/22/);
  });

  it("toApiDate", () => {
    expect(toApiDate("2024-10-05", "start")).toBe("2024-10-05 00:00:00");
    expect(toApiDate("2024-10-05", "end")).toBe("2024-10-05 23:59:59");
  });

  it("getInitials", () => {
    expect(getInitials("Abdullah Ubaid Khan")).toBe("AU");
    expect(getInitials("delcom")).toBe("D");
    expect(getInitials("   ")).toBe("?");
    expect(getInitials(undefined)).toBe("?");
  });

  it("resolveImageUrl", () => {
    expect(resolveImageUrl("")).toBe("");
    expect(resolveImageUrl("https://x.test/a.png")).toBe("https://x.test/a.png");
    expect(resolveImageUrl("img/profile/1.png")).toBe("https://open-api.delcom.org/img/profile/1.png");
    expect(resolveImageUrl("/img/profile/1.png")).toBe("https://open-api.delcom.org/img/profile/1.png");
  });

  it("isValidEmail", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("a@b")).toBe(false);
  });

  it("extractErrorMessage", () => {
    expect(extractErrorMessage({ message: "Data tidak valid", data: { email: ["Wajib", "Salah"], x: 1 } })).toBe(
      "Data tidak valid\nWajib\nSalah",
    );
    expect(extractErrorMessage({ message: "Gagal" })).toBe("Gagal");
    expect(extractErrorMessage(null)).toBe("Terjadi kesalahan pada server");
  });
});

describe("validateCashFlowForm", () => {
  it("lolos jika semua valid", () => {
    expect(validateCashFlowForm({ label: "gaji", nominal: "1000", description: "Gaji" })).toEqual({});
    expect(validateCashFlowForm({ label: "gaji", nominal: 1, description: "Gaji" })).toEqual({});
  });

  it("melaporkan setiap field yang tidak valid", () => {
    expect(validateCashFlowForm({ label: " ", nominal: "0", description: "" })).toEqual({
      label: "Label wajib diisi",
      nominal: "Nominal harus lebih dari 0",
      description: "Keterangan wajib diisi",
    });
    expect(validateCashFlowForm({ label: "a", nominal: "", description: "b" }).nominal).toBeDefined();
  });
});
