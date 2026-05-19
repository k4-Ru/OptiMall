function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizePreferences(preferences) {
  if (!Array.isArray(preferences)) return [];
  return preferences.map((p) => String(p || '').trim()).filter(Boolean);
}

export function normalizeActivityEvents(events) {
  if (!Array.isArray(events)) return [];
  return events
    .map((event) => ({
      event_type: String(event?.event_type || '').trim(),
      product_id: event?.product_id == null ? null : toNumber(event.product_id, null),
      search_query: event?.search_query ? String(event.search_query) : null,
    }))
    .filter((event) => event.event_type);
}

export function normalizeProducts(products) {
  if (!Array.isArray(products)) return [];
  return products
    .map((product) => ({
      id: toNumber(product?.id, 0),
      name: String(product?.name || '').trim(),
      category: product?.category ? String(product.category) : null,
      price: toNumber(product?.price, 0),
      rating: toNumber(product?.rating, 0),
      stock: toNumber(product?.stock, 0),
      tags: product?.tags ?? [],
      popularity_score: toNumber(product?.popularity_score, 0),
      outcome_boost: toNumber(product?.outcome_boost, 0),
      tag_vector: product?.tag_vector ?? null,
      extra: product?.extra ?? null,
    }))
    .filter((product) => product.id > 0 && product.name && product.price > 0);
}

export function buildPipelinePayload(input = {}) {
  const payload = {
    budget: toNumber(input.budget, 0),
    preferences: normalizePreferences(input.preferences),
    products: normalizeProducts(input.products),
    activity_events: normalizeActivityEvents(input.activity_events),
    latest_event: input.latest_event || null,
  };

  return payload;
}

export function validatePipelinePayload(input = {}) {
  const payload = buildPipelinePayload(input);
  const errors = [];

  if (!payload.budget || payload.budget <= 0) {
    errors.push('budget must be a positive number');
  }

  if (input.products != null && !Array.isArray(input.products)) {
    errors.push('products must be an array when provided');
  }

  if (input.preferences != null && !Array.isArray(input.preferences)) {
    errors.push('preferences must be an array when provided');
  }

  if (input.activity_events != null && !Array.isArray(input.activity_events)) {
    errors.push('activity_events must be an array when provided');
  }

  return {
    ok: errors.length === 0,
    errors,
    payload,
  };
}
