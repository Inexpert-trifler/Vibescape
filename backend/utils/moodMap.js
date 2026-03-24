const moodMap = {
  happy: 'happy upbeat songs official music video',
  sad: 'sad emotional songs official music video',
  energetic: 'workout high energy songs official music video'
};

const getMoodQuery = (mood) => moodMap[mood];

const getSupportedMoods = () => Object.keys(moodMap);

module.exports = {
  moodMap,
  getMoodQuery,
  getSupportedMoods
};
