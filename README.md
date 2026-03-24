# Vibescape

Vibescape is a mood-based music recommender with a scalable multi-page frontend structure and a modular Express backend that uses the free YouTube Data API v3.

## Project Structure

```text
vibescape/
├── frontend/
│   ├── pages/
│   ├── components/
│   ├── css/
│   ├── js/
│   ├── assets/
│   └── data/
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── utils/
│   ├── config/
│   ├── .env
│   └── package.json
└── README.md
```

## Frontend Notes

- `frontend/pages/` contains the multi-page HTML structure.
- `frontend/components/` stores reusable UI snippets like the navbar, player, and song card.
- `frontend/css/` is organized for `base`, `layout`, `components`, `animations`, and `themes`.
- `frontend/js/api.js` handles backend requests.
- `frontend/js/player.js` handles YouTube playback behavior.
- `frontend/js/mood.js` manages mood selection and UI state.
- `frontend/js/storage.js` manages `localStorage` for current mood, favorites, playlists, and recent songs.
- `frontend/data/mockSongs.js` is a fallback dataset for local development.

## Backend Features

- `GET /api/music/mood/:mood`
  Returns songs based on supported moods: `happy`, `sad`, `energetic`
- `GET /api/music/search?q=QUERY`
  Returns songs based on a search query
- Uses YouTube Data API v3 `search` endpoint
- Returns structured song data:
  - `videoId`
  - `title`
  - `thumbnail`
  - `channelName`

## Mood Mapping

- `happy` -> `happy upbeat songs`
- `sad` -> `sad emotional songs`
- `energetic` -> `workout high energy songs`

## Backend Setup

1. Go to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Add your YouTube API key in `backend/.env`:

```env
YOUTUBE_API_KEY=your_key_here
PORT=5000
```

4. Start the backend server:

```bash
npm run dev
```

The API will run at [http://localhost:5000](http://localhost:5000).

## Example Responses

```json
{
  "success": true,
  "mood": "happy",
  "query": "happy upbeat songs",
  "count": 2,
  "data": [
    {
      "videoId": "abc123",
      "title": "Happy Song",
      "thumbnail": "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
      "channelName": "Artist Channel"
    }
  ]
}
```

## Tech Stack

- Node.js
- Express.js
- Axios
- dotenv
- CORS
- YouTube Data API v3
