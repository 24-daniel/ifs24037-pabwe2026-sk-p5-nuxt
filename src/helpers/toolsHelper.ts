import Swal from "sweetalert2";

export function showSuccessDialog(message: string) {
  return Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: message,
    confirmButtonColor: "#4338ca",
  });
}

export function showErrorDialog(message: string) {
  return Swal.fire({
    icon: "error",
    title: "Gagal",
    text: message,
    confirmButtonColor: "#4338ca",
  });
}

export async function showConfirmDialog(message: string, confirmText: string): Promise<boolean> {
  const result = await Swal.fire({
    icon: "warning",
    title: "Konfirmasi",
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    confirmButtonColor: "#b91c1c",
  });
  return result.isConfirmed;
}

export function formatRupiah(value: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatDateTime(value?: string | null): string {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

/** Mengubah nilai input date (YYYY-MM-DD) menjadi timestamp query API. */
export function toApiDateTime(date: string, endOfDay: boolean): string {
  if (!date) {
    return "";
  }
  return `${date} ${endOfDay ? "23:59:59" : "00:00:00"}`;
}
