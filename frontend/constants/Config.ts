// frontend/constants/Config.ts


import Constants from 'expo-constants';
import { Platform } from 'react-native';

const YOUR_LOCAL_IP = '192.168.1.136';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5001';
  }
  // Para iOS y Android, usa la IP local
  return `http://${YOUR_LOCAL_IP}:5001`;
};

const getRedirectUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8081';
  }
  // Para iOS/Android, usa el scheme de Expo
  return 'exp://192.168.1.136:8081';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  REDIRECT_URL: getRedirectUrl(),
  GOOGLE_CLIENT_ID: '116507654475-mimfsmrn5qki5t9eavv5lg4f7b1lh860.apps.googleusercontent.com',
  MOVIE_API_KEY: 'ba77eac5',
};