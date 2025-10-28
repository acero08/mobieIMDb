// backend/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const movieDAO = require('../models/movieDAO');

const router = express.Router();

passport.use('google', new GoogleStrategy({ 
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const googleId = profile.id;
    const email = profile.emails[0].value;
    const displayName = profile.displayName;
    const user = await movieDAO.createUser(googleId, email, displayName);
    return done(null, user);
  } catch (error) {
    console.error(' Google auth error:', error);
    return done(error, null);
  }
}));

router.get('/google', (req, res, next) => {
  const redirectUri = req.query.redirect_uri;
  const state = redirectUri ? Buffer.from(redirectUri).toString('base64') : '';

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: state 
  })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/failure' }),
  (req, res) => {
    if (!req.user) {
      return res.redirect('/auth/failure?error=user_not_found');
    }
//se cre al toke jwt
    const token = jwt.sign(
      { id: req.user.id },
      process.env.SESSION_SECRET,
      { expiresIn: '7d' }
    );

    let redirectUrl = process.env.CLIENT_URL;
    if (req.query.state) {
      try {
        redirectUrl = Buffer.from(req.query.state, 'base64').toString('utf-8');
      } catch (e) { 
        console.error('Failed to decode state:', e); 
      }
    }

    
    const separator = redirectUrl.includes('?') ? '&' : '?';
    res.redirect(`${redirectUrl}${separator}token=${token}`);
  }
);

router.get('/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        displayName: req.user.display_name
      }
    });
  }
);

router.get('/failure', (req, res) => {
  res.status(401).json({ error: 'Authentication failed' });
});

router.get('/logout', (req, res) => {
  res.json({ message: 'Logged out (client should clear token)' });
});

module.exports = router;
