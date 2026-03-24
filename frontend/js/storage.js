const STORAGE_KEYS = {
  mood: 'vibescape_current_mood',
  favorites: 'vibescape_favorites',
  currentSong: 'vibescape_current_song',
  recent: 'vibescape_recent_songs',
  searchQuery: 'vibescape_search_query'
};

const readJson = (key, fallbackValue) => {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch (error) {
    console.error(`Failed to read localStorage key "${key}"`, error);
    return fallbackValue;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write localStorage key "${key}"`, error);
  }
};

export const AppStorage = {
  getCurrentMood() {
    return readJson(STORAGE_KEYS.mood, 'happy');
  },

  setCurrentMood(mood) {
    writeJson(STORAGE_KEYS.mood, mood);
  },

  getSearchQuery() {
    return readJson(STORAGE_KEYS.searchQuery, '');
  },

  setSearchQuery(query) {
    writeJson(STORAGE_KEYS.searchQuery, query);
  },

  clearSearchQuery() {
    localStorage.removeItem(STORAGE_KEYS.searchQuery);
  },

  getFavorites() {
    return readJson(STORAGE_KEYS.favorites, []);
  },

  addFavorite(song) {
    const favorites = AppStorage.getFavorites();
    const alreadySaved = favorites.some((item) => item.videoId === song.videoId);

    if (!alreadySaved) {
      favorites.push(song);
      writeJson(STORAGE_KEYS.favorites, favorites);
    }
  },

  removeFavorite(videoId) {
    const favorites = AppStorage.getFavorites().filter((item) => item.videoId !== videoId);
    writeJson(STORAGE_KEYS.favorites, favorites);
  },

  isFavorite(videoId) {
    return AppStorage.getFavorites().some((item) => item.videoId === videoId);
  },

  toggleFavorite(song) {
    if (AppStorage.isFavorite(song.videoId)) {
      AppStorage.removeFavorite(song.videoId);
      return false;
    }

    AppStorage.addFavorite(song);
    return true;
  },

  getCurrentSong() {
    return readJson(STORAGE_KEYS.currentSong, null);
  },

  setCurrentSong(song) {
    writeJson(STORAGE_KEYS.currentSong, song);
  },

  clearCurrentSong() {
    localStorage.removeItem(STORAGE_KEYS.currentSong);
  },

  getRecentSongs() {
    return readJson(STORAGE_KEYS.recent, []);
  },

  addRecentSong(song) {
    const recentSongs = AppStorage.getRecentSongs()
      .filter((item) => item.videoId !== song.videoId);

    recentSongs.unshift(song);
    writeJson(STORAGE_KEYS.recent, recentSongs.slice(0, 6));
  }
};
