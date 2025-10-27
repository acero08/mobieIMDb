// backend/routes/movieRoutes.js
const express = require('express');
const axios = require('axios');
const passport = require('passport'); // Necesitamos passport aquí
const movieDAO = require('../models/movieDAO');

const router = express.Router();

// --- Middleware de Autenticación JWT ---
// Esta función ahora usa la estrategia 'jwt' que configuramos en server.js
// session: false es crucial para JWT
const isAuthenticated = passport.authenticate('jwt', { session: false });

// --- Rutas (sin cambios en la lógica interna, solo aplica el nuevo middleware) ---

router.get('/search', isAuthenticated, async (req, res) => {
  console.log('GET /search (JWT)');
  // req.user está disponible aquí si el token es válido
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }
    const response = await axios.get('http://www.omdbapi.com/', {
      params: { apikey: process.env.MOVIE_API_KEY, s: query, type: 'movie' }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Movie search failed', details: error.message });
  }
});

router.post('/favorites', isAuthenticated, async (req, res) => {
  console.log('POST /favorites (JWT)');
  try {
    const { movieId, title, posterPath, releaseDate } = req.body;
    const userId = req.user.id; // Obtenido del token JWT
    if (!movieId || !title) {
      return res.status(400).json({ error: 'Movie ID and title required' });
    }
    const favorite = await movieDAO.addFavorite(userId, movieId, title, posterPath, releaseDate);
    res.status(201).json(favorite);
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({ error: 'Failed to add favorite', details: error.message });
  }
});

router.delete('/favorites/:movieId', isAuthenticated, async (req, res) => {
  console.log('DELETE /favorites/:movieId (JWT)');
  try {
    const { movieId } = req.params;
    const userId = req.user.id;
    const removed = await movieDAO.removeFavorite(userId, movieId);
    if (!removed) {
      return res.status(404).json({ error: 'Favorite not found' });
    }
    res.json({ message: 'Favorite removed', movie: removed });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite', details: error.message });
  }
});

router.get('/favorites', isAuthenticated, async (req, res) => {
  console.log('GET /favorites (JWT)');
  try {
    const userId = req.user.id;
    const favorites = await movieDAO.getFavorites(userId);
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to retrieve favorites', details: error.message });
  }
});

router.get('/favorites/:movieId/check', isAuthenticated, async (req, res) => {
  console.log('GET /favorites/:movieId/check (JWT)');
  try {
    const { movieId } = req.params;
    const userId = req.user.id;
    const isFavorite = await movieDAO.isFavorite(userId, movieId);
    res.json({ isFavorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Failed to check favorite status', details: error.message });
  }
});

module.exports = router;
