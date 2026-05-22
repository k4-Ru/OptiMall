import { buildPipelinePayload } from '../../shared/intelligenceContract.js';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const LAST_RECOMMENDATION_REQUEST_ID_KEY = 'optimall_last_recommendation_request_id';

function createApiError(response, data) {
  const message = data?.error || data?.message || `Request failed: ${response.status}`;
  const error = new Error(message);
  error.status = Number(response?.status || 0);
  error.error_type = data?.error_type || null;
  error.details = data?.details ?? null;
  error.meta = data?.meta || null;
  return error;
}

function readLastRecommendationRequestId() {
  try {
    const value = localStorage.getItem(LAST_RECOMMENDATION_REQUEST_ID_KEY);
    return value ? String(value) : null;
  } catch {
    return null;
  }
}

function writeLastRecommendationRequestId(requestId) {
  const safeId = String(requestId || '').trim();
  if (!safeId) return;
  try {
    localStorage.setItem(LAST_RECOMMENDATION_REQUEST_ID_KEY, safeId);
  } catch {
    // ignore storage issues
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json().catch(() => ({}));

  const responseRequestId = data?.meta?.request_id;
  if (responseRequestId) {
    writeLastRecommendationRequestId(responseRequestId);
  }

  if (!response.ok) {
    throw createApiError(response, data);
  }

  return data;
}

export function getProducts() {
  return request('/products');
}

export function getRelatedProducts(productId) {
  return request(`/products/${productId}/related`);
}

export function getProductReviews(productId) {
  return request(`/products/${productId}/reviews`);
}

export function postRecommendation(payload, token) {
  return request('/recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function postActivity(payload, token) {
  const lastRecommendationRequestId = readLastRecommendationRequestId();
  const finalPayload = {
    ...(payload || {}),
    recommendation_request_id:
      payload?.recommendation_request_id ||
      payload?.recommendationRequestId ||
      lastRecommendationRequestId ||
      null,
  };

  return request('/activity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(finalPayload),
  });
}

export function postIntelligencePipeline(payload, token) {
  return request('/intelligence/pipeline', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(buildPipelinePayload(payload)),
  });
}

export function postSaveBundle(payload, token) {
  return request('/bundles/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function postBundleRating(payload, token) {
  return request('/bundles/rate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload || {}),
  });
}

export function getPopularBundles(limit = 6) {
  const safeLimit = Math.max(1, Math.min(20, Number(limit) || 6));
  return request(`/bundles/popular?limit=${safeLimit}`);
}

export function postCheckout(payload, token) {
  return request('/orders/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload || {}),
  });
}

export function getCart(token) {
  return request('/cart', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function putCart(payload, token) {
  return request('/cart', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload || {}),
  });
}

export function getAdminReport(token) {
  return request('/admin/report', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function patchAdminUserFlag(userId, payload, token) {
  return request(`/admin/users/${userId}/flag`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload || {}),
  });
}
