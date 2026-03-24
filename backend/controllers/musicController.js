const youtubeService = require('../services/youtubeService');
const { getMoodQuery, getSupportedMoods } = require('../utils/moodMap');

const getMusicByMood = async (req, res, next) => {
  const mood = req.params.mood?.toLowerCase();
  const moodQuery = getMoodQuery(mood);

  if (!moodQuery) {
    return res.status(400).json({
      success: false,
      message: `Unsupported mood "${req.params.mood}". Supported moods: ${getSupportedMoods().join(', ')}.`
    });
  }

  try {
    const songs = await youtubeService.searchVideos(moodQuery);

    return res.status(200).json({
      success: true,
      mood,
      query: moodQuery,
      count: songs.length,
      message: songs.length
        ? 'Songs fetched successfully.'
        : 'No embeddable videos were found for this mood right now.',
      data: songs
    });
  } catch (error) {
    return next(error);
  }
};

const searchMusic = async (req, res, next) => {
  const query = req.query.q?.trim();

  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required. Use /api/music/search?q=your+song+name.'
    });
  }

  try {
    const songs = await youtubeService.searchVideos(query);

    return res.status(200).json({
      success: true,
      query,
      count: songs.length,
      message: songs.length
        ? 'Songs fetched successfully.'
        : 'No embeddable videos were found for this search.',
      data: songs
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMusicByMood,
  searchMusic
};
