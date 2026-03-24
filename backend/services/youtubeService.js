const axios = require('axios');
const config = require('../config/config');

const ensureApiKey = () => {
  if (!config.youtubeApiKey || config.youtubeApiKey === 'your_key_here') {
    const error = new Error('Missing YouTube API key. Update backend/.env with a valid YOUTUBE_API_KEY.');
    error.statusCode = 503;
    throw error;
  }
};

const formatVideo = (item) => ({
  videoId: item.id.videoId,
  title: item.snippet.title,
  thumbnail:
    item.snippet.thumbnails.high?.url ||
    item.snippet.thumbnails.medium?.url ||
    item.snippet.thumbnails.default?.url ||
    '',
  channelName: item.snippet.channelTitle
});

const searchVideos = async (query, maxResults = config.defaultMaxResults) => {
  ensureApiKey();

  try {
    const response = await axios.get(config.youtubeApiUrl, {
      params: {
        key: config.youtubeApiKey,
        part: 'snippet',
        q: query,
        type: 'video',
        videoEmbeddable: 'true',
        maxResults,
        videoCategoryId: '10'
      }
    });

    const items = response.data.items || [];
    return items
      .filter((item) => item.id && item.id.videoId && item.snippet)
      .map(formatVideo);
  } catch (error) {
    const statusCode = error.response?.status || 500;
    const apiMessage = error.response?.data?.error?.message;

    const serviceError = new Error(apiMessage || 'Unable to fetch songs from YouTube right now.');
    serviceError.statusCode = statusCode;
    serviceError.details = error.response?.data || error.message;
    throw serviceError;
  }
};

module.exports = {
  searchVideos
};
