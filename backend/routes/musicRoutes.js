const express = require('express');
const { getMusicByMood, searchMusic } = require('../controllers/musicController');

const router = express.Router();

router.get('/mood/:mood', getMusicByMood);
router.get('/search', searchMusic);

module.exports = router;
