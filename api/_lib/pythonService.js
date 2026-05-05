import axios from 'axios';

const baseURL = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';

async function postToPython(path, payload) {
  const response = await axios.post(`${baseURL}${path}`, payload, { timeout: 15000 });
  return response.data;
}

export async function getRecommendations(payload) {
  return postToPython('/recommend', payload);
}

export async function getPromotions(payload) {
  return postToPython('/intelligence/promotions', payload);
}

export async function getRealtimeRecommendations(payload) {
  return postToPython('/intelligence/realtime-recommendations', payload);
}

export async function getBundleOptimization(payload) {
  return postToPython('/intelligence/bundle-optimize', payload);
}

export async function getAnomalyCheck(payload) {
  return postToPython('/intelligence/anomaly-check', payload);
}

export async function getIntelligencePipeline(payload) {
  return postToPython('/intelligence/pipeline', payload);
}
