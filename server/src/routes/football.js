const express = require('express');
const router = express.Router();

// RapidAPI credentials from .env
const API_KEY = process.env.RAPIDAPI_KEY;
const API_HOST = process.env.RAPIDAPI_HOST;

// Base URL for API-Football v3
const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';

// Map friendly league keys to API IDs
const leagueMap = {
  epl: 39,
  laliga: 140,
  ucl: 2
};

// Static date ranges (can be made dynamic if desired)
const WEEKLY_RANGE = '?dateFrom=2024-12-03&dateTo=2024-12-10';
const PAST_RANGE_MAP = {
  epl: '?league=39&season=2024&from=2024-12-02&to=2024-12-08',
  laliga: '?league=140&season=2024&from=2024-12-02&to=2024-12-08'
};

// Common headers for RapidAPI
const rapidHeaders = {
  'x-rapidapi-key': API_KEY,
  'x-rapidapi-host': API_HOST
};

// GET /api/football/standings/:league
router.get('/standings/:league', async (req, res) => {
  const { league } = req.params;
  const leagueId = leagueMap[league.toLowerCase()];
  if (!leagueId) {
    return res.status(400).json({ error: 'Invalid league key' });
  }

  const url = `${BASE_URL}/standings?league=${leagueId}&season=2024`;
  try {
    const apiRes = await fetch(url, { headers: rapidHeaders });
    const json = await apiRes.json();
    res.json(json);
  } catch (err) {
    console.error('Standings proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
});

// GET /api/football/fixtures/weekly
router.get('/fixtures/weekly', async (req, res) => {
  const url = `${BASE_URL}/fixtures${WEEKLY_RANGE}`;
  try {
    const apiRes = await fetch(url, { headers: rapidHeaders });
    const json = await apiRes.json();
    res.json(json);
  } catch (err) {
    console.error('Weekly fixtures proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch weekly fixtures' });
  }
});

// GET /api/football/fixtures/past/:league
router.get('/fixtures/past/:league', async (req, res) => {
  const { league } = req.params;
  const range = PAST_RANGE_MAP[league.toLowerCase()];
  if (!range) {
    return res.status(400).json({ error: 'Invalid league key for past fixtures' });
  }

  const url = `${BASE_URL}/fixtures${range}`;
  try {
    const apiRes = await fetch(url, { headers: rapidHeaders });
    const json = await apiRes.json();
    res.json(json);
  } catch (err) {
    console.error('Past fixtures proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch past fixtures' });
  }
});

// GET /api/football/fixtures/live
router.get('/fixtures/live', async (req, res) => {
  const url = `${BASE_URL}/fixtures?live=all`;
  try {
    const apiRes = await fetch(url, { headers: rapidHeaders });
    const json = await apiRes.json();
    res.json(json);
  } catch (err) {
    console.error('Live fixtures proxy error:', err);
    res.status(500).json({ error: 'Failed to fetch live fixtures' });
  }
});

module.exports = router;
