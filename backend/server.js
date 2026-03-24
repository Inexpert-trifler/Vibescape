const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const musicRoutes = require('./routes/musicRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'Vibescape API',
    message: 'Vibescape backend is running.',
    endpoints: {
      mood: '/api/music/mood/:mood',
      search: '/api/music/search?q=QUERY'
    }
  });
});

app.use('/api/music', musicRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  console.error('Vibescape API error:', error.message);

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Something went wrong on the server.',
    ...(config.nodeEnv !== 'production' && error.details ? { details: error.details } : {})
  });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Vibescape backend running on http://localhost:${config.port}`);
  });
}

module.exports = app;
