//backend/server.js
require('dotenv').config();


const express = require('express');
const passport = require('passport');
const cors = require('cors');
const pool = require('./database'); // pool de conexion de db
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');

// --- Configuración de Passport JWT ---
const JwtStrategy = require('passport-jwt').Strategy;// validar tokens
const ExtractJwt = require('passport-jwt').ExtractJwt;//esxtraer jwt
const movieDAO = require('./models/movieDAO');// usuario x ID

//dice dnde buscar , clave secreta para verificaar jwt
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
  secretOrKey: process.env.SESSION_SECRET, 
};

// cuando el front envia un request con jwt
passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  console.log('JWT Strategy triggered, payload:', jwt_payload);
  try {
    // pa checar si todavia esta el usuario busca usuario en DB usando ID
    const user = await movieDAO.getUserById(jwt_payload.id);
    if (user) {
      console.log('JWT: User found:', user);
      return done(null, user); // exitoso
    } else {
      console.log('JWT: User not found for id:', jwt_payload.id);
      return done(null, false); // Usuario no encontrado
    }
  } catch (error) {
    console.error('JWT Strategy error:', error);
    return done(error, false);//valio vrga
  }
}));


//  Configuración Inicial 
const app = express();
const PORT = process.env.PORT || 5000;

console.log('=== Environment Variables ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('============================\n');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`>>> ${req.method} ${req.path}`);
  next();
});

// --- Passport (SIN Sesiones) ---
// AHORA SE USA JWT (SIN SESSISIONES) ya no usamos passport.session
app.use(passport.initialize()); 

// --- Rutas ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/auth', authRoutes);
app.use('/api/movies', movieRoutes);


// --- Manejador de Errores ---
app.use((err, req, res, next) => {
  console.error('FAAAAAAAAAAAAK Server error:', err);
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

//railway inicia el contenedor ejecutanode server luego 
//se cargan las variables 
//express se inicializa
//passport se configura con jwt strategy
//rutas se pues montan / auth //api etc
//iniciaa el servi
// request de internet luego railweay proxy y m,i servidoor 8080