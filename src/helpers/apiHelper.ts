const TOKEN_KEY = "delcom_access_token";

export type ApiStatus = "success" | "fail" | "error";

/** Bentuk respons standar Delcom Open API (ditambah httpStatus dari wrapper). */
export interface ApiResponse<T = any> {
  status: ApiStatus;
  message: string;
  data?: T;
  httpStatus?: number;
}

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

export interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  params?: QueryParams;
  body?: unknown;
  auth?: boolean;
}

export const getAccessToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const putAccessToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeAccessToken = (): void => localStorage.removeItem(TOKEN_KEY);

export const isSuccess = (response?: ApiResponse | null): boolean => response?.status === "success";

/** Membangun URL lengkap beserta query parameters (nilai kosong diabaikan). */
export function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(`${DELCOM_BASEURL}${path}`);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

/**
 * Wrapper fetch untuk REST API Delcom.
 * - Header `Authorization: Bearer <token>` otomatis (jika ada token dan auth = true)
 * - body FormData dikirim apa adanya, selain itu di-encode sebagai JSON
 * - Selalu mengembalikan ApiResponse (tidak pernah throw); respons 401 menghapus token
 */
export async function fetchApi<T = any>(
  path: string,
  { method = "GET", params, body, auth = true }: FetchOptions = {},
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const options: RequestInit = { method, headers };

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  if (body instanceof FormData) {
    options.body = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(buildUrl(path, params), options);
    const json = await response.json();
    if (response.status === 401) removeAccessToken();
    return { ...json, httpStatus: response.status };
  } catch {
    return { status: "fail", message: "Tidak dapat terhubung ke server", httpStatus: 0 };
  }
}

export const apiGet = <T = any>(path: string, params?: QueryParams) =>
  fetchApi<T>(path, { params });
export const apiPost = <T = any>(path: string, body?: unknown, auth?: boolean) =>
  fetchApi<T>(path, { method: "POST", body, auth });
export const apiPut = <T = any>(path: string, body?: unknown) =>
  fetchApi<T>(path, { method: "PUT", body });
export const apiDelete = <T = any>(path: string) => fetchApi<T>(path, { method: "DELETE" });
