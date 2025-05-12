const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});
const mongoose = require('mongoose');

// Route handlers
const authRoutes = require('./routes/auth');
const footballRoutes = require('./routes/football');
const favoritesRoutes = require('./routes/favorites'); // Added
const protect = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mount API routes BEFORE static middleware
app.use('/api/auth', authRoutes);
app.use('/api/football', protect, footballRoutes);
app.use('/api/favorites', protect, favoritesRoutes); // Added

// Serve static client files
app.use(express.static(path.join(__dirname, '../../client')));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
