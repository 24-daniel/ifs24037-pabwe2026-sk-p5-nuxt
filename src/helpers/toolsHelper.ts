import Swal from "sweetalert2";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ApiResponse } from "./apiHelper";

const colors = { confirmButtonColor: "#43194f", cancelButtonColor: "#475569" };

export const showSuccessDialog = (message: string, title = "Berhasil") =>
  Swal.fire({ icon: "success", title, text: message, ...colors });

export const showErrorDialog = (message: string, title = "Terjadi kesalahan") =>
  Swal.fire({ icon: "error", title, text: message, ...colors });

/** Mengembalikan true jika pengguna menekan tombol konfirmasi. */
export async function showConfirmDialog(message: string, title = "Apakah kamu yakin?"): Promise<boolean> {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal",
    ...colors,
  });
  return result.isConfirmed;
}

/** Menggabungkan class Tailwind secara aman (clsx + tailwind-merge). */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export const formatRupiah = (value: number | string | null | undefined): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

/** Menerima "2024-10-05 22:00:00" maupun ISO 8601; mengembalikan Date atau null. */
export function parseTimestamp(value?: string | null): Date | null {
  if (!value) return null;
  const text = String(value);
  const date = new Date(text.includes("T") ? text : text.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Tanggal dan waktu, mis. "5 Okt 2024 19.09". */
export function formatDate(value?: string | null): string {
  const date = parseTimestamp(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

/** Hanya tanggal, mis. "5 Okt 2024". */
export function formatDateOnly(value?: string | null): string {
  const date = parseTimestamp(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date);
}

/** "2024-10-05" (input date) -> "2024-10-05 00:00:00" atau "2024-10-05 23:59:59". */
export function toApiDate(value: string, edge: "start" | "end"): string {
  return `${value} ${edge === "start" ? "00:00:00" : "23:59:59"}`;
}

export const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

/** Menggabungkan pesan utama dan detail validasi dari respons gagal. */
export function extractErrorMessage(response?: Partial<ApiResponse> | null): string {
  const details = Object.values((response?.data as Record<string, unknown>) ?? {})
    .flat()
    .filter((item): item is string => typeof item === "string");
  const message = response?.message || "Terjadi kesalahan pada server";
  return details.length ? `${message}\n${details.join("\n")}` : message;
}

/** Path relatif dari API (mis. "img/profile/1.png") dijadikan URL absolut. */
export function resolveImageUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${new URL(DELCOM_BASEURL).origin}/${String(path).replace(/^\//, "")}`;
}

export const getInitials = (name?: string | null): string =>
  String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

export interface CashFlowFormInput {
  label: string;
  nominal: string | number;
  description: string;
}

/** Validasi form transaksi arus kas (dipakai AddModal & ChangeModal). */
export function validateCashFlowForm({ label, nominal, description }: CashFlowFormInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!String(label).trim()) errors.label = "Label wajib diisi";
  if (!(Number(nominal) > 0)) errors.nominal = "Nominal harus lebih dari 0";
  if (!String(description).trim()) errors.description = "Keterangan wajib diisi";
  return errors;
}
