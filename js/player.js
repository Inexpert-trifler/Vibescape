const Player = {
    currentSong: null,
    isPlaying: false,
    ytPlayer: null,
    
    init: () => {
        // Load YouTube API script dynamically
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = () => {
            Player.ytPlayer = new YT.Player('yt-player-container', {
                height: '0',
                width: '0',
                videoId: '',
                playerVars: { 
                    'autoplay': 0, 
                    'controls': 0, 
                    'disablekb': 1,
                    'fs': 0,
                    'rel': 0,
                    'modestbranding': 1,
                    'playsinline': 1
                },
                events: {
                    'onReady': () => console.log('YT Player ready'),
                    'onStateChange': Player.onStateChange
                }
            });
        };

        const playBtn = document.getElementById('play-pause-btn');
        if(playBtn) {
            playBtn.addEventListener('click', Player.togglePlay);
        }
    },

    onStateChange: (event) => {
        const playBtn = document.getElementById('play-pause-btn');
        if(!playBtn) return;
        
        if (event.data === YT.PlayerState.PLAYING) {
            Player.isPlaying = true;
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            playBtn.classList.add('playing', 'pulse-glow');
        } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
            Player.isPlaying = false;
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            playBtn.classList.remove('playing', 'pulse-glow');
        }
    },

    play: (song) => {
        Player.currentSong = song;
        
        // Update UI info
        document.getElementById('player-title').textContent = song.title;
        document.getElementById('player-artist').textContent = song.artist;
        document.getElementById('player-art').innerHTML = `<img src="${song.thumbnail}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
        
        // Show loading spinner while buffering
        const playBtn = document.getElementById('play-pause-btn');
        if(playBtn) {
            playBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        }
        
        // Tell YT Player to load video and auto-play
        if (Player.ytPlayer && Player.ytPlayer.loadVideoById) {
            Player.ytPlayer.loadVideoById(song.videoId);
        } else {
            console.error("YT Player not ready yet");
        }
        
        // Add to recent storage and re-render dashboard if active
        AppStorage.addRecent(song);
        if (App.currentRoute === 'dashboard') {
            App.renderDashboard();
        }
    },

    togglePlay: () => {
        if (!Player.currentSong || !Player.ytPlayer || !Player.ytPlayer.playVideo) return;
        
        if (Player.isPlaying) {
            Player.ytPlayer.pauseVideo();
        } else {
            Player.ytPlayer.playVideo();
        }
    }
};
