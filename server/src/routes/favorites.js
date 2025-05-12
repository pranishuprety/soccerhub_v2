const express = require('express');
const router = express.Router();
const Favorite = require('../../models/favorite');  // Correct relative path to server/models/favorite.js

// GET /api/favorites  → read current user's favorite
router.get('/', async (req, res) => {
  try {
    const fav = await Favorite.findOne({ user: req.user.id });
    res.json(fav || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/favorites → create or update (upsert)
router.post('/', async (req, res) => {
  const { team } = req.body;
  try {
    const fav = await Favorite.findOneAndUpdate(
      { user: req.user.id },
      { team },
      { new: true, upsert: true }
    );
    res.json(fav);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/favorites → remove favorite
router.delete('/', async (req, res) => {
  try {
    await Favorite.deleteOne({ user: req.user.id });
    res.json({ message: 'Favorite removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
