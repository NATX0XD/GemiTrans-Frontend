import { API_ROOT } from './apiBase';

const postJson = async (path, body) => {
  const response = await fetch(`${API_ROOT}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || `API error: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const requestLiveToken = (uid) => postJson('/live-token', { uid });

export const reportLiveUsage = async (uid, seconds) => {
  const rounded = Math.ceil(Number(seconds) || 0);
  if (rounded <= 0) return { billedSeconds: 0 };
  return postJson('/live-usage', { uid, seconds: rounded });
};
