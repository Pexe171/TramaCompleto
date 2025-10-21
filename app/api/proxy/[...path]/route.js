import { NextResponse } from 'next/server';

import { getServerApiBaseUrl } from '@/lib/apiConfig';

const backendBaseUrl = getServerApiBaseUrl();

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const stripApiSuffix = (value = '') => {
  if (!value) {
    return value;
  }

  try {
    const url = new URL(value);
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments[segments.length - 1] === 'api') {
      segments.pop();
      url.pathname = segments.length ? `/${segments.join('/')}` : '/';
    }
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch (_error) {
    return value.replace(/\/?api\/?$/i, '');
  }
};

const backendOrigin = backendBaseUrl ? trimTrailingSlash(stripApiSuffix(backendBaseUrl)) : null;

const DISALLOWED_REQUEST_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

const DISALLOWED_RESPONSE_HEADERS = new Set([
  'connection',
  'content-length',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
]);

const joinPathSegments = (segments = []) => segments.filter(Boolean).join('/');

const selectBaseUrlForPath = (pathSuffix) => {
  if (!pathSuffix) {
    return backendBaseUrl;
  }

  const [firstSegment] = pathSuffix.split('/');
  if (firstSegment && firstSegment.toLowerCase() === 'uploads' && backendOrigin) {
    return backendOrigin;
  }

  return backendBaseUrl;
};

const buildTargetUrl = (request, params) => {
  if (!backendBaseUrl) {
    return null;
  }

  const { search } = request.nextUrl;
  const pathSuffix = joinPathSegments(params?.path);
  const baseForRequest = selectBaseUrlForPath(pathSuffix);
  const normalizedBase = baseForRequest ? baseForRequest.replace(/\/$/, '') : '';
  const normalizedPath = pathSuffix ? `/${pathSuffix.replace(/^\/+/, '')}` : '';
  return `${normalizedBase}${normalizedPath}${search}`;
};

const prepareRequestHeaders = (headers) => {
  const forwarded = new Headers();

  headers.forEach((value, key) => {
    if (DISALLOWED_REQUEST_HEADERS.has(key.toLowerCase())) {
      return;
    }

    forwarded.set(key, value);
  });

  return forwarded;
};

const forwardToBackend = async (request, params) => {
  const targetUrl = buildTargetUrl(request, params);

  if (!targetUrl) {
    return NextResponse.json(
      { message: 'API de autenticação não configurada.' },
      { status: 500 },
    );
  }

  if (request.method === 'OPTIONS') {
    return NextResponse.json(null, {
      status: 204,
      headers: {
        'Cache-Control': 'no-store',
        Allow: 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD',
      },
    });
  }

  const init = {
    method: request.method,
    headers: prepareRequestHeaders(request.headers),
    redirect: 'manual',
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    const body = await request.arrayBuffer();
    if (body.byteLength > 0) {
      init.body = body;
    }
  }

  let backendResponse;

  try {
    backendResponse = await fetch(targetUrl, init);
  } catch (error) {
    console.error('[API Proxy] Falha ao encaminhar pedido para', targetUrl, error);
    return NextResponse.json(
      { message: 'Não foi possível contactar o servidor de autenticação.' },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();

  backendResponse.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();

    if (DISALLOWED_RESPONSE_HEADERS.has(lowerKey)) {
      return;
    }

    if (lowerKey === 'set-cookie') {
      responseHeaders.append(key, value);
      return;
    }

    responseHeaders.set(key, value);
  });

  responseHeaders.set('Cache-Control', 'no-store');

  const responseBody = await backendResponse.arrayBuffer();

  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
};

const handler = (request, context) => forwardToBackend(request, context.params);

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export { handler as GET };
export { handler as POST };
export { handler as PUT };
export { handler as PATCH };
export { handler as DELETE };
export { handler as OPTIONS };
export { handler as HEAD };
