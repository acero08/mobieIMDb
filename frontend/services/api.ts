// frontend/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants/Config';
import { Movie, Favorite, AuthResponse } from '../types';


const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// pa que funcione
api.interceptors.request.use(async (config) => {
// lee el JWT
  const token = await AsyncStorage.getItem('authToken'); 
  if (token) {

    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {

  getCurrentUser: async (): Promise<AuthResponse> => {
    const { data } = await api.get('/auth/current');
    return data;
  },
  

  logout: async () => {
    await AsyncStorage.removeItem('authToken');

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
