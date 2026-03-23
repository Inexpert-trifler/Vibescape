const songsByMood = {
  happy: {
    title: "Happy Picks",
    pill: "Sunny mood",
    songs: [
      {
        title: "Good as Hell",
        artist: "Lizzo",
        image: "🌞"
      },
      {
        title: "Walking on Sunshine",
        artist: "Katrina & The Waves",
        image: "🌼"
      },
      {
        title: "Can't Stop the Feeling!",
        artist: "Justin Timberlake",
        image: "💛"
      }
    ]
  },
  sad: {
    title: "Gentle Comfort",
    pill: "Rainy mood",
    songs: [
      {
        title: "Someone Like You",
        artist: "Adele",
        image: "🌧️"
      },
      {
        title: "Fix You",
        artist: "Coldplay",
        image: "🕯️"
      },
      {
        title: "Skinny Love",
        artist: "Bon Iver",
        image: "💙"
      }
    ]
  },
  energetic: {
    title: "Energy Boost",
    pill: "High-voltage mood",
    songs: [
      {
        title: "Stronger",
        artist: "Kanye West",
        image: "⚡"
      },
      {
        title: "Titanium",
        artist: "David Guetta ft. Sia",
        image: "🔥"
      },
      {
        title: "Don't Stop Me Now",
        artist: "Queen",
        image: "🚀"
      }
    ]
  }
};

const moodButtons = document.querySelectorAll(".mood-button");
const songsContainer = document.getElementById("songsContainer");
const moodTitle = document.getElementById("moodTitle");
const moodPill = document.getElementById("moodPill");
const loadingState = document.getElementById("loadingState");
let loadingTimer;

function createSongCard(song, index) {
  const card = document.createElement("article");
  card.className = "song-card";
  card.style.animationDelay = `${index * 0.12}s`;

  card.innerHTML = `
    <div class="song-art" aria-hidden="true">${song.image}</div>
    <span class="song-tag">Recommended</span>
    <h3>${song.title}</h3>
    <p>${song.artist}</p>
  `;

  return card;
}

function setActiveMoodButton(selectedMood) {
  moodButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mood === selectedMood);
  });
}

function renderSongs(mood) {
  const selectedMood = songsByMood[mood];

  if (!selectedMood) {
    return;
  }

  moodTitle.textContent = selectedMood.title;
  moodPill.textContent = selectedMood.pill;
  songsContainer.innerHTML = "";
  loadingState.classList.add("visible");

  window.clearTimeout(loadingTimer);

  loadingTimer = window.setTimeout(() => {
    loadingState.classList.remove("visible");

    selectedMood.songs.forEach((song, index) => {
      const card = createSongCard(song, index);
      songsContainer.appendChild(card);
    });
  }, 350);
}

function updateMood(mood) {
  document.body.classList.remove("mood-happy", "mood-sad", "mood-energetic");
  document.body.classList.add(`mood-${mood}`);
  setActiveMoodButton(mood);
  renderSongs(mood);
}

moodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateMood(button.dataset.mood);
  });
});

updateMood("happy");
