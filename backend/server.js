//backend/server.js
require('dotenv').config();

// --- Dependencias ---
const express = require('express');
const passport = require('passport');
const cors = require('cors');
const pool = require('./database'); // Tu pool de conexión
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');

// --- Configuración de Passport JWT ---
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const movieDAO = require('./models/movieDAO'); // Necesario para buscar usuario por ID

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae token del header 'Authorization: Bearer <token>'
  secretOrKey: process.env.SESSION_SECRET, // Usa tu SESSION_SECRET como clave para firmar/verificar JWT
};

passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  console.log('JWT Strategy triggered, payload:', jwt_payload);
  try {
    // jwt_payload contendrá lo que pusiste al crear el token (ej: { id: user.id })
    const user = await movieDAO.getUserById(jwt_payload.id);
    if (user) {
      console.log('JWT: User found:', user);
      return done(null, user); // Autenticación exitosa, adjunta user a req.user
    } else {
      console.log('JWT: User not found for id:', jwt_payload.id);
      return done(null, false); // Usuario no encontrado
    }
  } catch (error) {
    console.error('JWT Strategy error:', error);
    return done(error, false);
  }
}));


// --- Configuración Inicial ---
const app = express();
const PORT = process.env.PORT || 5000;

console.log('=== Environment Variables ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('============================\n');

// --- Middlewares ---
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`>>> ${req.method} ${req.path}`);
  next();
});

// --- Passport (SIN Sesiones) ---
app.use(passport.initialize()); // Ya no necesitamos passport.session()

// --- Rutas ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/auth', authRoutes);
app.use('/api/movies', movieRoutes);


// --- Manejador de Errores ---
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  if (process.env.NODE_ENV !== 'production') {
      console.error('Stack:', err.stack);
  }
  res.status(err.status || 500).json({
     error: 'Internal server error',
     message: process.env.NODE_ENV !== 'production' ? err.message : undefined
  });
});

// --- Iniciar Servidor ---
// Escuchar en 0.0.0.0 es importante para Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server is running and listening on 0.0.0.0:${PORT}`);
});

