import axios from 'axios';

const baseURL = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function classifyPythonError(error, path) {
  const status = error?.response?.status;
  if (status) {
    return {
      type: 'UPSTREAM_RESPONSE_ERROR',
      status,
      message: `Python engine returned ${status} for ${path}`,
      details: error.response?.data || null,
    };
  }

  if (error?.code === 'ECONNABORTED') {
    return {
      type: 'UPSTREAM_TIMEOUT',
      status: 504,
      message: `Python engine timeout for ${path}`,
      details: null,
    };
  }

  return {
    type: 'UPSTREAM_UNREACHABLE',
    status: 502,
    message: `Python engine unreachable for ${path}`,
    details: error?.message || null,
  };
}

async function postToPython(path, payload, context = {}) {
  const maxAttempts = 2;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await axios.post(`${baseURL}${path}`, payload, {
        timeout: 15000,
        headers: {
          'x-request-id': context.requestId || '',
        },
      });
      return response.data;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts && !error?.response?.status) {
        await sleep(250 * attempt);
        continue;
      }
    }
  }

  throw classifyPythonError(lastError, path);
}

export async function getRecommendations(payload, context) {
  return postToPython('/recommend', payload, context);
}

export async function getPromotions(payload, context) {
  return postToPython('/intelligence/promotions', payload, context);
}

export async function getRealtimeRecommendations(payload, context) {
  return postToPython('/intelligence/realtime-recommendations', payload, context);
}

export async function getBundleOptimization(payload, context) {
  return postToPython('/intelligence/bundle-optimize', payload, context);
}

export async function getAnomalyCheck(payload, context) {
  return postToPython('/intelligence/anomaly-check', payload, context);
}

export async function getIntelligencePipeline(payload, context) {
  return postToPython('/intelligence/pipeline', payload, context);
}
