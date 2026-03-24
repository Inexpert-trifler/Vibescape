import { AppStorage } from './storage.js';

const EMBED_ERROR_CODES = new Set([5, 100, 101, 150]);
const VERIFICATION_TIMEOUT_MS = 8000;

const embedUrl = (videoId, autoplay = true) => (
  `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? '1' : '0'}&mute=1`
);

const watchUrl = (videoId) => `https://www.youtube.com/watch?v=${videoId}`;

const normalizeSong = (song) => ({
  videoId: song.videoId,
  title: song.title,
  thumbnail: song.thumbnail,
  channelName: song.channelName || 'YouTube'
});

const state = {
  ytApiReady: false,
  verifierPlayer: null,
  pendingSong: null,
  verificationToken: 0,
  verificationTimer: null
};

const dispatchSongChange = (song) => {
  document.dispatchEvent(new CustomEvent('vibescape:player-song-change', {
    detail: { song }
  }));
};

const dispatchPlayerStatus = (message, tone = 'info') => {
  document.dispatchEvent(new CustomEvent('vibescape:player-status', {
    detail: { message, tone }
  }));
};

const ensureStatusNode = () => {
  let statusNode = document.getElementById('player-status');
  if (statusNode) {
    return statusNode;
  }

  const playerText = document.querySelector('.player-text');
  if (!playerText) {
    return null;
  }

  statusNode = document.createElement('p');
  statusNode.id = 'player-status';
  statusNode.className = 'text-sec text-sm mt-1';
  statusNode.style.minHeight = '1.25rem';
  playerText.appendChild(statusNode);

  return statusNode;
};

const updateStatusMessage = (message = '', tone = 'info') => {
  const statusNode = ensureStatusNode();
  if (!statusNode) {
    return;
  }

  statusNode.textContent = message;
  statusNode.style.color = tone === 'error' ? 'var(--theme-1)' : 'var(--text-sec)';
};

const renderInlinePlayer = (container) => {
  container.innerHTML = `
    <div class="player-bar glass-panel blur-heavy" style="position:relative; min-height: 240px; padding: 1.25rem; display:grid; gap:1rem;">
      <div class="player-song-info" style="display:flex; align-items:center; gap:1rem;">
        <div class="player-art" id="player-art">🎵</div>
        <div class="player-text">
          <h4 id="player-title">Select a song</h4>
          <p id="player-artist" class="text-sec text-sm mt-1">Your current track will appear here.</p>
          <p id="player-status" class="text-sec text-sm mt-1" style="min-height:1.25rem;"></p>
        </div>
      </div>
      <div id="player-embed-shell" style="width:100%; aspect-ratio:16 / 9; border-radius:18px; overflow:hidden; background:rgba(255,255,255,0.03); position:relative; border:1px solid rgba(255,255,255,0.08);">
        <div id="player-loading" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; gap:0.75rem; background:rgba(5,5,5,0.6); color:var(--text-main); z-index:2; opacity:0; pointer-events:none; transition:opacity 0.25s ease;">
          <i class="fa-solid fa-spinner fa-spin"></i>
          <span>Loading player...</span>
        </div>
        <div id="player-embed" style="width:100%; height:100%; opacity:0; transition:opacity 0.35s ease;"></div>
      </div>
      <div style="display:flex; justify-content:flex-end;">
        <button id="player-action-btn" class="btn-primary" type="button">Play Current Song</button>
      </div>
    </div>
  `;
};

const ensurePlayerUi = () => {
  const inlineContainer = document.getElementById('player');
  if (inlineContainer && !document.getElementById('player-embed')) {
    renderInlinePlayer(inlineContainer);
  }
};

const showLoadingState = (message = 'Loading player...') => {
  const loadingNode = document.getElementById('player-loading');
  const embedNode = document.getElementById('player-embed');

  if (loadingNode) {
    const label = loadingNode.querySelector('span');
    if (label) {
      label.textContent = message;
    }

    loadingNode.style.opacity = '1';
    loadingNode.style.pointerEvents = 'auto';
  }

  if (embedNode) {
    embedNode.style.opacity = '0';
  }
};

const hideLoadingState = () => {
  const loadingNode = document.getElementById('player-loading');
  const embedNode = document.getElementById('player-embed');

  if (loadingNode) {
    loadingNode.style.opacity = '0';
    loadingNode.style.pointerEvents = 'none';
  }

  if (embedNode) {
    embedNode.style.opacity = '1';
  }
};

const updatePlayerMetadata = (song, autoplay) => {
  ensurePlayerUi();

  const art = document.getElementById('player-art');
  const title = document.getElementById('player-title');
  const artist = document.getElementById('player-artist');
  const actionButton = document.getElementById('player-action-btn') || document.getElementById('play-pause-btn');

  if (art) {
    art.innerHTML = `<img src="${song.thumbnail}" alt="${song.title}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
  }

  if (title) {
    title.textContent = song.title;
  }

  if (artist) {
    artist.textContent = song.channelName;
  }

  if (actionButton && actionButton.id === 'player-action-btn') {
    actionButton.textContent = autoplay ? 'Now Playing' : 'Resume Song';
  }

  if (actionButton && actionButton.id === 'play-pause-btn') {
    actionButton.innerHTML = '<i class="fa-solid fa-play"></i>';
  }
};

const renderEmbed = (song, autoplay) => {
  const embedContainer = document.getElementById('player-embed') || document.getElementById('yt-player-container');
  if (!embedContainer) {
    return null;
  }

  const iframe = document.createElement('iframe');
  iframe.width = '100%';
  iframe.height = '100%';
  iframe.src = embedUrl(song.videoId, autoplay);
  iframe.title = song.title;
  iframe.frameBorder = '0';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = '0';
  iframe.style.background = '#000';

  iframe.addEventListener('load', () => {
    hideLoadingState();
  }, { once: true });

  embedContainer.innerHTML = '';
  embedContainer.appendChild(iframe);
  return iframe;
};

const clearVerificationTimer = () => {
  if (state.verificationTimer) {
    window.clearTimeout(state.verificationTimer);
    state.verificationTimer = null;
  }
};

const openFallback = (song) => {
  updateStatusMessage("This video can't be played here. Opening on YouTube...", 'error');
  dispatchPlayerStatus("This video can't be played here. Opening on YouTube...", 'error');
  hideLoadingState();

  const popup = window.open(watchUrl(song.videoId), '_blank', 'noopener,noreferrer');

  if (!popup) {
    updateStatusMessage("This video can't be played here. Please open it on YouTube from your browser.", 'error');
  }
};

const handleVerifierError = (errorCode) => {
  if (!Player.currentSong || !EMBED_ERROR_CODES.has(errorCode)) {
    return;
  }

  clearVerificationTimer();
  openFallback(Player.currentSong);
};

const ensureVerifierContainer = () => {
  let container = document.getElementById('yt-verifier-container');
  if (container) {
    return container;
  }

  container = document.createElement('div');
  container.id = 'yt-verifier-container';
  container.style.position = 'absolute';
  container.style.width = '1px';
  container.style.height = '1px';
  container.style.opacity = '0';
  container.style.pointerEvents = 'none';
  container.style.left = '-9999px';
  document.body.appendChild(container);
  return container;
};

const verifyCurrentSong = (song, autoplay) => {
  if (!state.ytApiReady || !state.verifierPlayer) {
    state.pendingSong = { song, autoplay };
    return;
  }

  const token = Date.now();
  state.verificationToken = token;
  state.pendingSong = null;
  clearVerificationTimer();

  state.verificationTimer = window.setTimeout(() => {
    if (state.verificationToken !== token) {
      return;
    }

    hideLoadingState();
    updateStatusMessage('Playback is taking longer than usual. If it stays blocked, Vibescape will open YouTube for you.');
  }, VERIFICATION_TIMEOUT_MS);

  try {
    state.verifierPlayer.mute();
    state.verifierPlayer.loadVideoById(song.videoId);

    if (!autoplay) {
      state.verifierPlayer.pauseVideo();
    }
  } catch (error) {
    console.error('YouTube verifier failed to load the video.', error);
    clearVerificationTimer();
    openFallback(song);
  }
};

const initializeYoutubeApi = () => {
  if (window.YT && typeof window.YT.Player === 'function') {
    if (state.verifierPlayer) {
      return;
    }

    const container = ensureVerifierContainer();
    state.verifierPlayer = new window.YT.Player(container, {
      height: '1',
      width: '1',
      videoId: '',
      playerVars: {
        autoplay: 1,
        controls: 0,
        mute: 1,
        playsinline: 1,
        rel: 0
      },
      events: {
        onReady: () => {
          state.ytApiReady = true;

          if (state.pendingSong) {
            verifyCurrentSong(state.pendingSong.song, state.pendingSong.autoplay);
          }
        },
        onError: (event) => {
          handleVerifierError(event.data);
        },
        onStateChange: (event) => {
          if (!Player.currentSong) {
            return;
          }

          if ([window.YT.PlayerState.PLAYING, window.YT.PlayerState.BUFFERING, window.YT.PlayerState.CUED].includes(event.data)) {
            clearVerificationTimer();
            hideLoadingState();
            updateStatusMessage('');
          }
        }
      }
    });
    return;
  }

  if (document.querySelector('script[data-youtube-api="true"]')) {
    return;
  }

  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  tag.async = true;
  tag.dataset.youtubeApi = 'true';
  document.head.appendChild(tag);

  const previousReadyHandler = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    if (typeof previousReadyHandler === 'function') {
      previousReadyHandler();
    }

    initializeYoutubeApi();
  };
};

export const Player = {
  currentSong: null,

  init() {
    ensurePlayerUi();
    initializeYoutubeApi();

    const actionButton = document.getElementById('player-action-btn');
    if (actionButton && actionButton.dataset.playerBound !== 'true') {
      actionButton.dataset.playerBound = 'true';
      actionButton.addEventListener('click', () => {
        if (Player.currentSong) {
          Player.play(Player.currentSong, { autoplay: true });
        }
      });
    }

    const footerButton = document.getElementById('play-pause-btn');
    if (footerButton && footerButton.dataset.playerBound !== 'true') {
      footerButton.dataset.playerBound = 'true';
      footerButton.addEventListener('click', () => {
        if (Player.currentSong) {
          Player.play(Player.currentSong, { autoplay: true });
        }
      });
    }

    document.addEventListener('vibescape:player-status', (event) => {
      updateStatusMessage(event.detail?.message, event.detail?.tone);
    });

    const savedSong = AppStorage.getCurrentSong();
    if (savedSong) {
      Player.play(savedSong, { autoplay: false });
    }
  },

  play(song, options = {}) {
    const { autoplay = true } = options;
    const normalizedSong = normalizeSong(song);

    Player.currentSong = normalizedSong;
    AppStorage.setCurrentSong(normalizedSong);
    AppStorage.addRecentSong(normalizedSong);

    updatePlayerMetadata(normalizedSong, autoplay);
    showLoadingState(autoplay ? 'Loading video...' : 'Preparing player...');
    updateStatusMessage('');
    renderEmbed(normalizedSong, autoplay);
    verifyCurrentSong(normalizedSong, autoplay);
    dispatchSongChange(normalizedSong);
  }
};
