const TOKEN_KEY = "delcom_cashflow_access_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function putAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export type QueryParams = Record<string, string | number | null | undefined>;

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: QueryParams;
  auth?: boolean;
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, query, auth = true } = options;

  const url = new URL(`${DELCOM_BASEURL}${path}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  try {
    const response = await fetch(url.toString(), { method, headers, body: payload });
    const json = await response.json();
    return {
      success: json.status === "success",
      message: json.message,
      data: json.data ?? null,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan jaringan",
      data: null,
    };
  }
}
