const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';

const normalizeBaseUrl = (baseUrl) => {
  if (!baseUrl) return DEFAULT_API_BASE_URL;
  return baseUrl.replace(/\/$/, '');
};

export const API_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL);

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
