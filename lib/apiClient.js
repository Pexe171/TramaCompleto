const normalizeBaseUrl = (baseUrl) => {
  if (!baseUrl) return null;
  return baseUrl.replace(/\/$/, '');
};

const normalizeOrigin = (value) => {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed.replace(/^\/+/, '')}`.replace(/\/$/, '');
  }

  return trimmed.replace(/\/$/, '');
};

const inferServerOrigin = () => {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
    process.env.VERCEL_URL,
    process.env.RENDER_EXTERNAL_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeOrigin(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return null;
};

const inferBrowserOrigin = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.location.origin;
  } catch (_error) {
    return null;
  }
};

const FALLBACK_BACKEND_PORT =
  process.env.NEXT_PUBLIC_API_PORT ||
  process.env.NEXT_PUBLIC_BACKEND_PORT ||
  process.env.API_PORT ||
  '5000';

const inferLocalBackendOrigin = (originUrl) => {
  if (!originUrl.port && !['localhost', '127.0.0.1'].includes(originUrl.hostname)) {
    return null;
  }

  const shouldAdjustPort =
    ['localhost', '127.0.0.1'].includes(originUrl.hostname) || originUrl.port;

  if (!shouldAdjustPort) {
    return null;
  }

  if (originUrl.port === FALLBACK_BACKEND_PORT) {
    return null;
  }

  const candidate = new URL(originUrl.toString());
  candidate.port = FALLBACK_BACKEND_PORT;
  return candidate.origin;
};

const inferDevTunnelBackendOrigin = (originUrl) => {
  if (!originUrl.hostname.includes('.devtunnels.')) {
    return null;
  }

  const match = originUrl.hostname.match(/^(.*)-(\d+)\.(.+)$/);
  if (!match) {
    return null;
  }

  const [, prefix, port, suffix] = match;
  if (port === FALLBACK_BACKEND_PORT) {
    return null;
  }

  const candidateHost = `${prefix}-${FALLBACK_BACKEND_PORT}.${suffix}`;
  return `${originUrl.protocol}//${candidateHost}`;
};

const inferCompanionBackendOrigin = (origin) => {
  if (!origin) {
    return null;
  }

  try {
    const parsedOrigin = new URL(origin);
    const transformers = [inferLocalBackendOrigin, inferDevTunnelBackendOrigin];

    for (const transformer of transformers) {
      const result = transformer(parsedOrigin);
      if (result) {
        return result;
      }
    }
  } catch (_error) {
    return null;
  }

  return null;
};

const inferDefaultBaseUrl = () => {
  const browserOrigin = inferBrowserOrigin();
  if (browserOrigin) {
    const companionOrigin = inferCompanionBackendOrigin(browserOrigin);
    const resolvedOrigin = (companionOrigin || browserOrigin).replace(/\/$/, '');
    return `${resolvedOrigin}/api`;
  }

  const serverOrigin = inferServerOrigin();
  if (serverOrigin) {
    const companionOrigin = inferCompanionBackendOrigin(serverOrigin);
    const resolvedOrigin = (companionOrigin || serverOrigin).replace(/\/$/, '');
    return `${resolvedOrigin}/api`;
  }

  return `http://localhost:${FALLBACK_BACKEND_PORT}/api`;
};

let memoizedBaseUrl = null;

export const getApiBaseUrl = () => {
  if (memoizedBaseUrl) {
    return memoizedBaseUrl;
  }

  const envCandidates = [
    process.env.NEXT_PUBLIC_API_BASE_URL,
    process.env.API_BASE_URL,
  ];

  for (const candidate of envCandidates) {
    const normalized = normalizeBaseUrl(candidate);
    if (normalized) {
      memoizedBaseUrl = normalized;
      return memoizedBaseUrl;
    }
  }

  memoizedBaseUrl = normalizeBaseUrl(inferDefaultBaseUrl());
  return memoizedBaseUrl;
};

export const API_BASE_URL = getApiBaseUrl();

const API_ORIGIN = (() => {
  try {
    const url = new URL(API_BASE_URL);
    if (url.pathname.endsWith('/api')) {
      url.pathname = url.pathname.replace(/\/api$/, '');
    }
    return url.toString().replace(/\/$/, '');
  } catch (_error) {
    return API_BASE_URL.replace(/\/api$/, '');
  }
})();

const resolveBody = (body) => {
  if (!body || body instanceof FormData) {
    return body;
  }

  return JSON.stringify(body);
};

const resolveHeaders = (body, headers = {}) => {
  const resolvedHeaders = new Headers(headers);
  if (!(body instanceof FormData) && !resolvedHeaders.has('Content-Type')) {
    resolvedHeaders.set('Content-Type', 'application/json');
  }
  return resolvedHeaders;
};

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem('authToken');
  } catch (_error) {
    return null;
  }
};

async function fetcher(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const body = resolveBody(options.body);
  const headers = resolveHeaders(options.body, options.headers);
  const token = options.token || getStoredToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const fetchOptions = {
    method: options.method || (body ? 'POST' : 'GET'),
    body,
    headers,
    credentials: 'include',
    cache: options.cache || 'no-store',
  };

  if (options.signal) {
    fetchOptions.signal = options.signal;
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    let message = 'Ocorreu um erro ao comunicar com a API.';
    try {
      const errorData = await response.json();
      if (errorData?.message) {
        message = errorData.message;
      }
    } catch (_error) {
      // Sem conteúdo JSON, mantém mensagem padrão
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export const apiClient = {
  get: (endpoint, options = {}) => fetcher(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => fetcher(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => fetcher(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => fetcher(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => fetcher(endpoint, { ...options, method: 'DELETE' }),
};

export const resolveAssetUrl = (path) => {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}/${path.replace(/^\/+/, '')}`;
};

export const clearStoredToken = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem('authToken');
  } catch (_error) {
    // Sem acesso ao storage
  }
};

export const storeAuthToken = (token) => {
  if (typeof window === 'undefined' || !token) {
    return;
  }

  try {
    window.localStorage.setItem('authToken', token);
  } catch (_error) {
    // Sem acesso ao storage
  }
};
