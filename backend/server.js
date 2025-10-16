

// backend/server.js
require('dotenv').config();

// 2. Import Dependencies
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');

// --- CRITICAL FIX ---
// 3. Import and initialize the database connection FIRST.
// If the database fails to connect, we want to know immediately.
const pool = require('./database');

// 4. Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');

// 5. Create and Configure the Express App
const app = express();
const PORT = process.env.PORT || 5000;

// 6. Setup Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Passport middleware must be after session middleware
app.use(passport.initialize());
app.use(passport.session());

// 7. Use the Routes
app.use('/auth', authRoutes);
app.use('/api/movies', movieRoutes);

// 8. Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 9. Start the Server
app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
});

// 10. Add Global Error Catcher (helps find hidden errors)
//process.on('uncaughtException', (err) => {
  //console.error('There was an uncaught error:', err);
  //process.exit(1); // Exit the process with an error code
//});

