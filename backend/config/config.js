const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(__dirname, '../.env')
});

module.exports = {
  port: Number(process.env.PORT) || 5000,
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
  youtubeApiUrl: 'https://www.googleapis.com/youtube/v3/search',
  nodeEnv: process.env.NODE_ENV || 'development',
  defaultMaxResults: 12
};
