//frontend/types/index.ts

export interface User {
  id: number;
  email: string;
  displayName: string;
}

export interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
}

export interface Favorite {
  movie_id: string;
  title: string;
  poster_path: string;
  release_date: string;
  added_at: string;
}

export interface AuthResponse {
  authenticated: boolean;
  user?: User;
}