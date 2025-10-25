//frontend/services/api.ts

import axios from 'axios';
import { API_CONFIG } from '../constants/Config';
import { Movie, Favorite, AuthResponse } from '../types';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  getCurrentUser: async (): Promise<AuthResponse> => {
    const { data } = await api.get('/auth/current');
    return data;
  },
  
  logout: async () => {
    const { data } = await api.get('/auth/logout');
    return data;
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