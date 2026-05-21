import { buildPipelinePayload } from '../../shared/intelligenceContract.js';

const API_BASE = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || `Request failed: ${response.status}`);
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
  return request('/activity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
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
