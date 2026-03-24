import { AppStorage } from './storage.js';

const SUPPORTED_MOODS = ['happy', 'sad', 'energetic'];

const getSafeMood = (mood) => (
  SUPPORTED_MOODS.includes(mood) ? mood : 'happy'
);

export const applyMoodTheme = (mood) => {
  const safeMood = getSafeMood(mood);
  document.body.classList.remove('mood-happy', 'mood-sad', 'mood-energetic');
  document.body.classList.add(`mood-${safeMood}`);

  document.querySelectorAll('.mood-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.mood === safeMood);
  });

  return safeMood;
};

export const getCurrentMood = () => getSafeMood(AppStorage.getCurrentMood());

export const setMood = (mood, options = {}) => {
  const { redirect = true } = options;
  const safeMood = getSafeMood(mood);

  AppStorage.setCurrentMood(safeMood);
  AppStorage.clearSearchQuery();
  applyMoodTheme(safeMood);

  if (redirect) {
    window.location.href = 'results.html';
  }

  return safeMood;
};

export const initMoodSelection = (options = {}) => {
  const { redirectOnSelect = true } = options;
  applyMoodTheme(getCurrentMood());

  document.querySelectorAll('.mood-btn').forEach((button) => {
    if (button.dataset.moodBound === 'true') {
      return;
    }

    button.dataset.moodBound = 'true';
    button.addEventListener('click', () => {
      setMood(button.dataset.mood, { redirect: redirectOnSelect });
    });
  });
};
