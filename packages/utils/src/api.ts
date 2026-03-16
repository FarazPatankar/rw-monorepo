/**
 * Build a URL for an internal service.
 * On Railway, services communicate via private networking using
 * `<SERVICE_NAME>.railway.internal` hostnames.
 */
export function createApiUrl(
  base: string,
  path: string,
  params?: Record<string, string>,
): string {
  const url = new URL(path, base);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`fetch ${url} failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
