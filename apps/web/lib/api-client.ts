const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

/** API'nin kök adresi (sondaki /api olmadan) — /uploads gibi statik dosya yollarını çözmek için. */
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { accessToken?: string } = {},
): Promise<T> {
  const { accessToken, headers, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      // FormData uploads need the browser to set Content-Type itself (with the multipart boundary).
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { message?: string });
    throw new ApiError(res.status, body.message ?? "Bir hata oluştu");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
