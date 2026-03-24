import { fetchSongsByMood, searchSongs } from './api.js';
import { initMoodSelection, applyMoodTheme, getCurrentMood } from './mood.js';
import { Player } from './player.js';
import { AppStorage } from './storage.js';

const PAGE_PATH = window.location.pathname.split('/').pop() || 'index.html';

const moodMeta = {
  happy: {
    title: 'Happy Matches',
    subtitle: 'Top tracks for a bright and upbeat mood.'
  },
  sad: {
    title: 'Sad Matches',
    subtitle: 'Gentle and emotional songs for quieter moments.'
  },
  energetic: {
    title: 'Energetic Matches',
    subtitle: 'High-energy songs to keep the momentum going.'
  }
};

const normalizeSong = (song) => ({
  videoId: song.videoId,
  title: song.title,
  thumbnail: song.thumbnail,
  channelName: song.channelName || 'YouTube'
});

const getCurrentPlayingVideoId = () => Player.currentSong?.videoId || AppStorage.getCurrentSong()?.videoId || null;

const animateCard = (card, index) => {
  card.style.animation = 'fadeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both';
  card.style.animationDelay = `${Math.min(index * 0.05, 0.3)}s`;
};

const applyPlayingStyles = (card, isPlaying) => {
  card.style.borderColor = isPlaying ? 'var(--theme-1)' : '';
  card.style.boxShadow = isPlaying
    ? '0 0 0 1px rgba(255,255,255,0.05), 0 0 24px rgba(255, 140, 0, 0.25)'
    : '';
  card.style.transform = isPlaying ? 'translateY(-4px)' : '';
};

const createSongCard = (song, options = {}) => {
  const { removable = false, onFavoriteToggle = null } = options;
  const normalizedSong = normalizeSong(song);
  const card = document.createElement('article');
  const isFavorite = AppStorage.isFavorite(normalizedSong.videoId);
  const isPlaying = getCurrentPlayingVideoId() === normalizedSong.videoId;

  card.className = 'song-card glass-panel bounce-hover';
  card.style.position = 'relative';
  card.dataset.videoId = normalizedSong.videoId;
  card.innerHTML = `
    <div class="song-thumb-wrapper">
      <img src="${normalizedSong.thumbnail}" class="song-thumb" alt="${normalizedSong.title}" style="width:100%;height:100%;object-fit:cover;">
    </div>
    <div class="song-info">
      <h3 style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${normalizedSong.title}</h3>
      <p class="text-sec" style="font-size:0.9rem;">${normalizedSong.channelName}</p>
      <p class="text-sec text-sm mt-1 song-playing-label" style="min-height:1.1rem; color:${isPlaying ? 'var(--theme-1)' : 'var(--text-sec)'};">
        ${isPlaying ? 'Now playing' : ''}
      </p>
    </div>
    <div style="display:flex; gap:0.75rem; margin-top:1rem;">
      <button class="btn-primary song-play-btn" type="button" style="flex:1;">Play</button>
      <button class="btn-outline song-favorite-btn" type="button" aria-label="Toggle favorite">
        <i class="${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart" style="${isFavorite ? 'color: var(--theme-1);' : ''}"></i>
      </button>
    </div>
  `;

  card.querySelector('.song-play-btn').addEventListener('click', () => {
    Player.play(normalizedSong, { autoplay: true });
  });

  card.querySelector('.song-favorite-btn').addEventListener('click', () => {
    const saved = AppStorage.toggleFavorite(normalizedSong);
    const icon = card.querySelector('.song-favorite-btn i');

    icon.className = `${saved ? 'fa-solid' : 'fa-regular'} fa-heart`;
    icon.style.color = saved ? 'var(--theme-1)' : '';

    if (removable && !saved) {
      card.remove();
    }

    if (typeof onFavoriteToggle === 'function') {
      onFavoriteToggle();
    }
  });

  applyPlayingStyles(card, isPlaying);
  return card;
};

const setContainerMessage = (container, message) => {
  container.innerHTML = `
    <div class="empty-state text-center my-5 w-100" style="grid-column:1 / -1;">
      <p class="text-sec">${message}</p>
    </div>
  `;
};

const setLoadingState = (container, message) => {
  container.innerHTML = `
    <div class="empty-state text-center my-5 w-100" style="grid-column:1 / -1;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size:1.6rem; color:var(--theme-1); margin-bottom:0.85rem;"></i>
      <p class="text-sec">${message}</p>
    </div>
  `;
};

const updatePlayingSongHighlight = () => {
  const currentVideoId = getCurrentPlayingVideoId();

  document.querySelectorAll('[data-video-id]').forEach((card) => {
    const isPlaying = card.dataset.videoId === currentVideoId;
    const label = card.querySelector('.song-playing-label');

    applyPlayingStyles(card, isPlaying);

    if (label) {
      label.textContent = isPlaying ? 'Now playing' : '';
      label.style.color = isPlaying ? 'var(--theme-1)' : 'var(--text-sec)';
    }
  });
};

const updateResultsHeading = (query, mood) => {
  const title = document.getElementById('results-title');
  const subtitle = document.getElementById('results-subtitle');
  if (!title || !subtitle) {
    return;
  }

  if (query) {
    title.textContent = 'Search Results';
    subtitle.textContent = `Showing matches for "${query}"`;
    return;
  }

  const currentMoodMeta = moodMeta[mood] || moodMeta.happy;
  title.textContent = currentMoodMeta.title;
  subtitle.textContent = currentMoodMeta.subtitle;
};

const renderSongs = (container, songs, options = {}) => {
  const { emptyMessage = 'No songs found.', removable = false, onFavoriteToggle = null } = options;
  container.innerHTML = '';

  if (!songs.length) {
    setContainerMessage(container, emptyMessage);
    return;
  }

  songs.forEach((song, index) => {
    const card = createSongCard(song, { removable, onFavoriteToggle });
    animateCard(card, index);
    container.appendChild(card);
  });

  updatePlayingSongHighlight();
};

const handleSearchSubmit = () => {
  const searchInput = document.querySelector('.search-bar input');
  if (!searchInput || searchInput.dataset.searchBound === 'true') {
    return;
  }

  const searchParams = new URLSearchParams(window.location.search);
  searchInput.value = searchParams.get('q') || AppStorage.getSearchQuery() || '';

  searchInput.dataset.searchBound = 'true';
  searchInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') {
      return;
    }

    const query = searchInput.value.trim();
    if (!query) {
      return;
    }

    AppStorage.setSearchQuery(query);
    window.location.href = `results.html?q=${encodeURIComponent(query)}`;
  });
};

const renderDashboard = () => {
  const recentContainer = document.getElementById('recent-grid');
  const favoritesPreview = document.getElementById('dashboard-fav-preview');

  if (recentContainer) {
    const recentSongs = AppStorage.getRecentSongs();
    recentContainer.innerHTML = '';

    if (!recentSongs.length) {
      recentContainer.innerHTML = '<p class="text-sec my-4">No recently played songs yet.</p>';
    } else {
      recentSongs.forEach((song) => {
        const item = normalizeSong(song);
        const recentCard = document.createElement('div');
        recentCard.className = 'recent-card glass-panel bounce-hover';
        recentCard.innerHTML = `
          <div class="recent-art"><img src="${item.thumbnail}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></div>
          <div class="recent-info">
            <h4>${item.title}</h4>
            <p class="text-sec text-sm" style="margin-top:2px;">${item.channelName}</p>
          </div>
        `;
        recentCard.addEventListener('click', () => Player.play(item, { autoplay: true }));
        recentContainer.appendChild(recentCard);
      });
    }
  }

  if (favoritesPreview) {
    renderSongs(favoritesPreview, AppStorage.getFavorites().slice(0, 3), {
      emptyMessage: 'No favorites yet. Start saving songs you love.',
      onFavoriteToggle: renderDashboard
    });
  }
};

const showHomeView = (route) => {
  document.querySelectorAll('.view').forEach((view) => {
    view.classList.remove('active');
    view.style.display = 'none';
  });

  const targetView = document.getElementById(`view-${route}`);
  if (targetView) {
    targetView.style.display = 'block';
    requestAnimationFrame(() => {
      targetView.classList.add('active');
    });
  }
};

const bindHomeNavigation = () => {
  document.querySelectorAll('[data-route]').forEach((link) => {
    if (link.dataset.routeBound === 'true') {
      return;
    }

    link.dataset.routeBound = 'true';
    link.addEventListener('click', (event) => {
      const route = link.dataset.route;
      if (!route) {
        return;
      }

      if (route === 'results') {
        event.preventDefault();
        window.location.href = 'results.html';
        return;
      }

      if (route === 'favorites') {
        event.preventDefault();
        window.location.href = 'favorites.html';
        return;
      }

      event.preventDefault();
      window.location.hash = route;
      showHomeView(route);

      document.querySelectorAll('.nav-link').forEach((navLink) => {
        navLink.classList.toggle('active', navLink.dataset.route === route);
      });

      if (route === 'dashboard') {
        renderDashboard();
      }
    });
  });

  const route = window.location.hash.replace('#', '') || 'landing';
  if (route === 'results') {
    window.location.replace('results.html');
    return;
  }

  if (route === 'favorites') {
    window.location.replace('favorites.html');
    return;
  }

  showHomeView(route);
  if (route === 'dashboard') {
    renderDashboard();
  }
};

const loadResultsPage = async () => {
  const container = document.getElementById('songs-container') || document.getElementById('results-grid');
  if (!container) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const queryFromUrl = urlParams.get('q');
  const storedQuery = AppStorage.getSearchQuery();
  const query = queryFromUrl || storedQuery;
  const mood = getCurrentMood();

  updateResultsHeading(query, mood);
  setLoadingState(container, 'Loading songs for your vibe...');

  try {
    const songs = query
      ? await searchSongs(query)
      : await fetchSongsByMood(mood);

    if (queryFromUrl) {
      AppStorage.setSearchQuery(queryFromUrl);
    } else if (!query) {
      AppStorage.clearSearchQuery();
    }

    renderSongs(container, songs.map(normalizeSong), {
      emptyMessage: 'No embeddable songs found for this mood yet.'
    });
  } catch (error) {
    console.error('Failed to load results:', error);
    setContainerMessage(container, 'We could not load songs right now. Please try again in a moment.');
  }
};

const loadFavoritesPage = () => {
  const container = document.getElementById('favorites-container') || document.getElementById('favorites-grid');
  if (!container) {
    return;
  }

  const renderFavorites = () => {
    renderSongs(container, AppStorage.getFavorites(), {
      emptyMessage: 'No favorites saved yet.',
      removable: true,
      onFavoriteToggle: renderFavorites
    });
  };

  renderFavorites();
};

const initHomePage = () => {
  bindHomeNavigation();
  renderDashboard();
};

const initPage = async () => {
  applyMoodTheme(getCurrentMood());
  initMoodSelection({ redirectOnSelect: true });
  handleSearchSubmit();
  Player.init();
  document.addEventListener('vibescape:player-song-change', updatePlayingSongHighlight);

  if (PAGE_PATH === 'results.html') {
    await loadResultsPage();
    return;
  }

  if (PAGE_PATH === 'favorites.html') {
    loadFavoritesPage();
    return;
  }

  initHomePage();
};

document.addEventListener('DOMContentLoaded', initPage);
