const App = {
    currentRoute: 'landing',
    
    init: () => {
        App.bindEvents();
        Player.init();
        Mood.set('happy');
        
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            App.navigate(hash);
        } else {
            App.navigate('landing'); 
        }
    },

    bindEvents: () => {
        document.querySelectorAll('[data-route]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                App.navigate(e.currentTarget.closest('[data-route]').dataset.route);
            });
        });
        
        document.addEventListener('click', (e) => {
            const moodBtn = e.target.closest('.mood-btn');
            if(moodBtn) {
                const moodStr = moodBtn.dataset.mood;
                Mood.set(moodStr);
                
                if(App.currentRoute !== 'results') {
                    App.navigate('results');
                } else {
                    App.renderResults();
                }
            }
        });
        
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            if(hash && hash !== App.currentRoute) App.navigate(hash);
        });
    },

    navigate: (route) => {
        App.currentRoute = route;
        
        window.history.pushState(null, null, `#${route}`);
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.route === route);
        });

        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
            view.style.display = 'none';
        });

        const targetView = document.getElementById(`view-${route}`);
        if(targetView) {
            targetView.style.display = 'block';
            setTimeout(() => targetView.classList.add('active'), 50);
            
            const mainContent = document.querySelector('.main-content');
            if(mainContent) mainContent.scrollTop = 0;
        }

        if (route === 'dashboard') App.renderDashboard();
        if (route === 'favorites') App.renderFavorites();
        if (route === 'results') App.renderResults();
    },

    createSongCard: (song) => {
        const isFav = AppStorage.isFavorite(song.id);
        const card = document.createElement('div');
        card.className = 'song-card glass-panel bounce-hover';
        
        const safeSongJson = JSON.stringify(song).replace(/'/g, "&#39;");

        card.innerHTML = `
            <div class="song-thumb-wrapper" onclick='Player.play(${safeSongJson})'>
                <img src="${song.thumbnail}" class="song-thumb" alt="${song.title}" style="width:100%;height:100%;object-fit:cover;">
                <div class="play-overlay"><div class="play-circle"><i class="fa-solid fa-play" style="padding-left:3px;"></i></div></div>
            </div>
            <div class="song-info">
                <h3 style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${song.title}</h3>
                <p class="text-sec" style="font-size:0.9rem;">${song.artist}</p>
            </div>
            <button class="like-btn" onclick='App.toggleFavorite("${song.id}", this, ${safeSongJson})' title="Add to Favorites" style="position:absolute; bottom:1.2rem; right:1.2rem; background:transparent; border:none; font-size:1.2rem; cursor:pointer; z-index:2;">
                <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart" style="${isFav ? 'color: var(--theme-1);' : 'color: var(--text-sec);'} transition:all 0.2s;" onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1)';"></i>
            </button>
        `;
        return card;
    },

    toggleFavorite: (songId, btnEl, songObj) => {
        event.stopPropagation();
        const icon = btnEl.querySelector('i');
        
        if (AppStorage.isFavorite(songId)) {
            AppStorage.removeFavorite(songId);
            icon.classList.replace('fa-solid', 'fa-regular');
            icon.style.color = 'var(--text-sec)';
        } else {
            AppStorage.addFavorite(songObj);
            icon.classList.replace('fa-regular', 'fa-solid');
            icon.style.color = 'var(--theme-1)';
        }

        if (App.currentRoute === 'favorites') {
            App.renderFavorites();
        }
        if (App.currentRoute === 'dashboard') {
            App.renderDashboard();
        }
    },

    renderDashboard: () => {
        const recentContainer = document.getElementById('recent-grid');
        if (recentContainer) {
            recentContainer.innerHTML = '';
            const recents = AppStorage.getRecent();
            if (recents.length === 0) {
                recentContainer.innerHTML = '<p class="text-sec my-4">No recently played songs.</p>';
            } else {
                recents.forEach(song => {
                    const safeSongJson = JSON.stringify(song).replace(/'/g, "&#39;");
                    recentContainer.innerHTML += `
                        <div class="recent-card glass-panel bounce-hover" onclick='Player.play(${safeSongJson})'>
                            <div class="recent-art"><img src="${song.thumbnail}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></div>
                            <div class="recent-info">
                                <h4>${song.title}</h4>
                                <p class="text-sec text-sm" style="margin-top:2px;">${song.artist}</p>
                            </div>
                        </div>
                    `;
                });
            }
        }

        const favContainer = document.getElementById('dashboard-fav-preview');
        if (favContainer) {
            favContainer.innerHTML = '';
            const favs = AppStorage.getFavorites().slice(0, 3);
            if (favs.length === 0) {
                favContainer.innerHTML = '<p class="text-sec my-4" style="grid-column:1/-1;">No favorites yet. Add some to see them here.</p>';
            } else {
                favs.forEach(song => favContainer.appendChild(App.createSongCard(song)));
            }
        }
    },

    renderFavorites: () => {
        const container = document.getElementById('favorites-grid');
        if (!container) return;
        container.innerHTML = '';
        
        const favs = AppStorage.getFavorites();
        if (favs.length === 0) {
            container.innerHTML = `
                <div class="empty-state text-center my-5 w-100" style="grid-column: 1 / -1;">
                    <i class="fa-regular fa-heart fa-3x mb-3 text-sec"></i>
                    <h2>No favorites found</h2>
                    <p class="text-sec mt-2 mb-4">Explore moods and click the heart icon to save songs here.</p>
                    <button class="btn-primary" onclick="App.navigate('moods')">Explore Moods</button>
                </div>
            `;
        } else {
            favs.forEach(song => container.appendChild(App.createSongCard(song)));
        }
    },

    renderResults: () => {
        const container = document.getElementById('results-grid');
        if (!container) return;
        container.innerHTML = '';

        const currentMoodLabel = Mood.current.charAt(0).toUpperCase() + Mood.current.slice(1);
        document.getElementById('results-title').textContent = `${currentMoodLabel} Matches`;
        
        const emojiMap = { happy: '😄', sad: '😔', energetic: '⚡' };
        document.getElementById('results-subtitle').innerHTML = `Top tracks matched for your ${currentMoodLabel} vibe <span style="margin-left:5px;">${emojiMap[Mood.current]}</span>`;
        
        const songs = mockSongs[Mood.current] || [];
        songs.forEach(song => container.appendChild(App.createSongCard(song)));
    }
};

document.addEventListener('DOMContentLoaded', App.init);
