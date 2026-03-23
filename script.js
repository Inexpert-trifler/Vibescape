const songsByMood = {
  happy: {
    title: "Happy Picks",
    pill: "Sunny mood",
    songs: [
      { title: "Good as Hell", artist: "Lizzo", image: "🌞" },
      { title: "Walking on Sunshine", artist: "Katrina & The Waves", image: "🌼" },
      { title: "Can't Stop the Feeling!", artist: "Justin Timberlake", image: "💛" }
    ]
  },
  sad: {
    title: "Gentle Comfort",
    pill: "Rainy mood",
    songs: [
      { title: "Someone Like You", artist: "Adele", image: "🌧️" },
      { title: "Fix You", artist: "Coldplay", image: "🕯️" },
      { title: "Skinny Love", artist: "Bon Iver", image: "💙" }
    ]
  },
  energetic: {
    title: "Energy Boost",
    pill: "High-voltage mood",
    songs: [
      { title: "Stronger", artist: "Kanye West", image: "⚡" },
      { title: "Titanium", artist: "David Guetta ft. Sia", image: "🔥" },
      { title: "Don't Stop Me Now", artist: "Queen", image: "🚀" }
    ]
  }
};

const moodButtons = document.querySelectorAll(".mood-button");
const songsContainer = document.getElementById("songsContainer");
const moodTitle = document.getElementById("moodTitle");
const moodPill = document.getElementById("moodPill");
const loadingState = document.getElementById("loadingState");
const particlesContainer = document.getElementById("particles");
let loadingTimer;

function createParticles(mood) {
  if (!particlesContainer) return;
  particlesContainer.innerHTML = '';
  const numParticles = mood === 'energetic' ? 30 : (mood === 'sad' ? 15 : 20);
  
  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement('div');
    particle.className = `particle ${mood}`;
    
    // Random positioning and styling
    const size = Math.random() * 8 + 4;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.top = `${Math.random() * 100}vh`;
    
    // Use CSS variable to pass random peak opacity to keyframes
    const peakOpacity = Math.random() * 0.5 + 0.2;
    particle.style.setProperty('--peak-op', peakOpacity);
    
    // Different animation speeds based on mood
    const duration = mood === 'energetic' ? (Math.random() * 3 + 3) : 
                     (mood === 'sad' ? (Math.random() * 15 + 15) : (Math.random() * 8 + 6));
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${Math.random() * 5}s`;
    
    particlesContainer.appendChild(particle);
  }
}

function createSongCard(song, index) {
  const card = document.createElement("article");
  card.className = "song-card";
  card.style.animationDelay = `${index * 0.1}s`;

  card.innerHTML = `
    <div class="song-art-wrapper">
      <div class="song-art" aria-hidden="true">${song.image}</div>
      <div class="play-overlay">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
    <div class="song-info">
      <h3>${song.title}</h3>
      <p>${song.artist}</p>
    </div>
    <button class="like-btn" aria-label="Like">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  `;

  return card;
}

function setActiveMoodButton(selectedMood) {
  moodButtons.forEach((button) => {
    if (button.dataset.mood === selectedMood) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

function renderSongs(mood) {
  const selectedMood = songsByMood[mood];
  if (!selectedMood) return;

  // Add exit transition
  const currentCards = songsContainer.querySelectorAll('.song-card');
  currentCards.forEach(card => card.style.opacity = '0');

  moodTitle.textContent = selectedMood.title;
  moodPill.textContent = selectedMood.pill;
  
  window.clearTimeout(loadingTimer);
  
  setTimeout(() => {
    songsContainer.innerHTML = "";
    loadingState.classList.add("visible");
    
    loadingTimer = window.setTimeout(() => {
      loadingState.classList.remove("visible");

      selectedMood.songs.forEach((song, index) => {
        const card = createSongCard(song, index);
        songsContainer.appendChild(card);
      });
    }, 600);
  }, 250);
}

function updateMood(mood) {
  document.body.className = `mood-${mood}`;
  setActiveMoodButton(mood);
  renderSongs(mood);
  createParticles(mood);
}

moodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if(!button.classList.contains("active")) {
      updateMood(button.dataset.mood);
    }
  });
});

// Initialize on page load
updateMood("happy");
