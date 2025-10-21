const FALLBACK_BACKEND_PORT =
  process.env.NEXT_PUBLIC_API_PORT ||
  process.env.NEXT_PUBLIC_BACKEND_PORT ||
  process.env.API_PORT ||
  '5000';

const ENV_BASE_URL_KEYS = [
  'NEXT_PUBLIC_API_BASE_URL',
  'API_BASE_URL',
  'BACKEND_API_BASE_URL',
  'NEXT_PUBLIC_BACKEND_API_BASE_URL',
  'NEXT_PUBLIC_BACKEND_URL',
  'BACKEND_URL',
  'NEXT_PUBLIC_API_URL',
  'API_URL',
];

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const ensureProtocol = (value) => {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value.replace(/^\/+/, '')}`;
};

const normalizeBaseUrl = (value) => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const candidate = new URL(ensureProtocol(trimmed));
    candidate.hash = '';
    candidate.search = '';

    const normalized = trimTrailingSlash(candidate.toString());
    return normalized;
  } catch (_error) {
    return null;
  }
};

const resolveEnvBaseUrl = () => {
  for (const key of ENV_BASE_URL_KEYS) {
    const value = process.env[key];
    const normalized = normalizeBaseUrl(value);
    if (normalized) {
      return normalized;
    }
  }

  return null;
};

const resolveFallbackBaseUrl = () => normalizeBaseUrl(`http://127.0.0.1:${FALLBACK_BACKEND_PORT}/api`);

const serverBaseUrl = resolveEnvBaseUrl() || resolveFallbackBaseUrl();

const proxyBasePath = '/api/proxy';

const resolveApiOrigin = () => {
  if (!serverBaseUrl) {
    return null;
  }

  try {
    const parsed = new URL(serverBaseUrl);
    if (parsed.pathname.endsWith('/api')) {
      parsed.pathname = parsed.pathname.replace(/\/api$/, '');
    }
    return trimTrailingSlash(parsed.toString());
  } catch (_error) {
    return trimTrailingSlash(serverBaseUrl.replace(/\/api$/, ''));
  }
};

export const getServerApiBaseUrl = () => serverBaseUrl;
export const getBrowserApiBaseUrl = () => proxyBasePath;
export const getApiOrigin = () => resolveApiOrigin();
export const getFallbackBackendPort = () => FALLBACK_BACKEND_PORT;
