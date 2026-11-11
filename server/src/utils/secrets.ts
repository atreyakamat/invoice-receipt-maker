/**
 * Login secrets. In production a missing or short secret stops the server at
 * start-up instead of silently falling back to a value that is public in this
 * repository (anyone could then sign their own login tokens).
 */
const DEV_FALLBACKS: Record<string, string> = {
  JWT_SECRET: 'dev-only-jwt-secret-not-for-production-000000',
  REFRESH_SECRET: 'dev-only-refresh-secret-not-for-production-00',
};

export function requireSecret(name: 'JWT_SECRET' | 'REFRESH_SECRET', env: NodeJS.ProcessEnv = process.env): string {
  const value = env[name] ?? '';
  if (value.length >= 32) return value;
  if (env.NODE_ENV === 'production') {
    throw new Error(`${name} must be set to 32+ random characters in production (openssl rand -hex 32).`);
  }
  if (env.NODE_ENV !== 'test') console.warn(`[config] ${name} missing or short - using an insecure development secret`);
  return DEV_FALLBACKS[name];
}

/** Valid http(s) origins from a comma or space separated list. */
export function parseOrigins(v: string | undefined): string[] {
  return (v || '')
    .split(/[\s,]+/)
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter((o) => /^https?:\/\/[^\s'";/]+$/.test(o));
}
