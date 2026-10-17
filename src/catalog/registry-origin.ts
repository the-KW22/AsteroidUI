export function isLoopbackOrigin(origin: string) {
  const host = new URL(origin).hostname.toLowerCase();
  return host === "localhost" || host.endsWith(".localhost") || host === "[::1]" || /^127\./.test(host);
}

export function validateRegistryOrigin(value: string | undefined) {
  let address: URL;
  try {
    if (!value?.trim()) throw new Error();
    address = new URL(value.trim());
  } catch {
    throw new Error("Provide a valid REGISTRY_ORIGIN.");
  }
  const loopback = isLoopbackOrigin(address.origin);
  if (address.username || address.password || address.search || address.hash || address.pathname !== "/" ||
    (address.protocol !== "https:" && !(address.protocol === "http:" && loopback)) ||
    (address.protocol === "https:" && loopback)) {
    throw new Error("REGISTRY_ORIGIN must be a public HTTPS origin or an HTTP loopback origin, without credentials, query, hash, or path.");
  }
  return address.origin;
}

export function resolveRegistryOrigin(fallback: string, environment: NodeJS.ProcessEnv = process.env) {
  const configured = environment.REGISTRY_ORIGIN?.trim();
  if (environment.VERCEL_ENV === "production" && !configured) {
    throw new Error("Set REGISTRY_ORIGIN to your public HTTPS origin for Vercel production builds.");
  }
  const origin = validateRegistryOrigin(configured || fallback);
  if (environment.VERCEL_ENV === "production" && isLoopbackOrigin(origin)) {
    throw new Error("REGISTRY_ORIGIN must be a public HTTPS origin for Vercel production builds.");
  }
  return origin;
}
