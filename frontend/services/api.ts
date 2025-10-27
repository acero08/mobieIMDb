// frontend/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants/Config';
import { Movie, Favorite, AuthResponse } from '../types';

// 1. Crear la instancia de Axios. Eliminamos withCredentials: true.
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor: Agrega el token JWT a cada request
api.interceptors.request.use(async (config) => {
  // Usamos 'authToken' porque lo estandarizamos así en login.tsx
  const token = await AsyncStorage.getItem('authToken'); 
  if (token) {
    // Adjunta el token en el formato estándar "Authorization: Bearer <token>"
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  // Esta ruta es usada por _layout.tsx para verificar si el token es válido.
  getCurrentUser: async (): Promise<AuthResponse> => {
    const { data } = await api.get('/auth/current');
    return data;
  },
  
  // El logout en JWT es simplemente borrar el token del almacenamiento local.
  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    // El servidor ya no necesita hacer nada
    return { message: 'Logged out successfully' };
  },
};

export const movieAPI = {
  search: async (query: string): Promise<{ Search: Movie[] }> => {
    const { data } = await api.get('/api/movies/search', {
      params: { query },
    });
    return data;
  },
  
  getFavorites: async (): Promise<Favorite[]> => {
    // Esta ruta enviará el token JWT en el header (gracias al interceptor)
    const { data } = await api.get('/api/movies/favorites');
    return data;
  },
  
  addFavorite: async (movie: {
    movieId: string;
    title: string;
    posterPath: string;
    releaseDate: string;
  }) => {
    const { data } = await api.post('/api/movies/favorites', movie);
    return data;
  },
  
  removeFavorite: async (movieId: string) => {
    const { data } = await api.delete(`/api/movies/favorites/${movieId}`);
    return data;
  },
  
  checkFavorite: async (movieId: string): Promise<{ isFavorite: boolean }> => {
    const { data } = await api.get(`/api/movies/favorites/${movieId}/check`);
    return data;
  },
};

export default api;
