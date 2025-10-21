import {
  getApiOrigin,
  getBrowserApiBaseUrl,
  getServerApiBaseUrl,
} from './apiConfig';

const normalizeEndpoint = (endpoint) => {
  if (!endpoint) {
    return '';
  }

  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

const API_ORIGIN = getApiOrigin();
const SERVER_API_BASE_URL = getServerApiBaseUrl();
const BROWSER_API_BASE_URL = getBrowserApiBaseUrl();
export const API_BASE_URL = SERVER_API_BASE_URL;

const resolveRuntimeBaseUrl = () => {
  if (typeof window === 'undefined') {
    return SERVER_API_BASE_URL;
  }

  return getBrowserApiBaseUrl();
};

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
  const runtimeBaseUrl = resolveRuntimeBaseUrl();
  const url = `${runtimeBaseUrl}${normalizeEndpoint(endpoint)}`;
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

  let response;

  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    console.error('[API] Falha de rede ao contactar', url, error);
    throw new Error('Não foi possível contactar o servidor. Tente novamente em instantes.');
  }

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

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '0.0.0.0']);
const LOOPBACK_SUFFIXES = ['.local'];

const isLoopbackOrigin = (origin) => {
  if (!origin) {
    return false;
  }

  try {
    const { hostname } = new URL(origin);
    if (LOOPBACK_HOSTS.has(hostname)) {
      return true;
    }

    return LOOPBACK_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
  } catch (_error) {
    return false;
  }
};

const normalizeAssetPath = (value) => value.replace(/^\/+/, '');

const buildProxiedAssetUrl = (path) => {
  const normalizedProxyBase = (BROWSER_API_BASE_URL || '/api/proxy').replace(/\/$/, '');
  return `${normalizedProxyBase}/${normalizeAssetPath(path)}`;
};

export const resolveAssetUrl = (path) => {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (API_ORIGIN && !isLoopbackOrigin(API_ORIGIN)) {
    return `${API_ORIGIN}/${normalizeAssetPath(path)}`;
  }

  return buildProxiedAssetUrl(path);
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
