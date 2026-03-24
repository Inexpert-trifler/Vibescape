const BASE_URL = 'http://localhost:5001/api/music';
const REQUEST_TIMEOUT_MS = 12000;

const parseResponse = async (response) => {
  let payload = {};

  try {
    payload = await response.json();
  } catch (error) {
    console.error('Failed to parse API response.', error);
  }

  if (!response.ok) {
    throw new Error(payload.message || 'Unable to fetch songs right now.');
  }

  return Array.isArray(payload.data) ? payload.data : [];
};

const request = async (url) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    return await parseResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('API request timed out:', url);
      throw new Error('The request took too long. Please try again.');
    }

    console.error('API request failed:', error);
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const fetchSongsByMood = async (mood) => {
  if (!mood) {
    throw new Error('Mood is required to fetch songs.');
  }

  return request(`${BASE_URL}/mood/${encodeURIComponent(mood)}`);
};

export const searchSongs = async (query) => {
  if (!query || !query.trim()) {
    throw new Error('Search query is required.');
  }

  return request(`${BASE_URL}/search?q=${encodeURIComponent(query.trim())}`);
};
