// frontend/app/movie/[id].tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { API_CONFIG } from "../../constants/Config";
import { movieAPI } from "../../services/api";

interface MovieDetail {
  imdbID: string;
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  Type: string;

  Response: string;
  Error?: string;
}

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchMovieDetails();
    checkFavoriteStatus();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      const response = await axios.get("http://www.omdbapi.com/", {
        params: {
          apikey: API_CONFIG.MOVIE_API_KEY,
          i: id,
        },
      });
      setMovie(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const res = await movieAPI.checkFavorite(id as string);
      setIsFavorite(res.isFavorite);
    } catch (e) {
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async () => {
    if (!movie) return;
    try {
      if (isFavorite) {
        await movieAPI.removeFavorite(movie.imdbID);
        setIsFavorite(false);
      } else {
        await movieAPI.addFavorite({
          movieId: movie.imdbID,
          title: movie.Title,
          posterPath: movie.Poster,
          releaseDate: movie.Released,
        });
        setIsFavorite(true);
      }
    } catch (e) {
      // Optionally show error
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!movie || movie.Response === "False") {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Movie not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Image
        source={{
          uri:
            movie.Poster !== "N/A"
              ? movie.Poster
              : "https://via.placeholder.com/300x450",
        }}
        style={styles.poster}
        resizeMode="contain" // Cambiado a 'contain' para que la imagen se ajuste al contenedor
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{movie.Title}</Text>
          <TouchableOpacity onPress={toggleFavorite}>
            <Text style={styles.heartLarge}>{isFavorite ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.meta}>
          <Text style={styles.metaText}>{movie.Year}</Text>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.metaText}>{movie.Rated}</Text>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.metaText}>{movie.Runtime}</Text>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.metaText}>{movie.Type}</Text>
        </View>

        {movie.imdbRating && movie.imdbRating !== "N/A" && (
          <View style={styles.rating}>
            <Text style={styles.ratingText}>⭐ {movie.imdbRating}/10</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Plot</Text>
        <Text style={styles.plot}>{movie.Plot}</Text>

        <Text style={styles.sectionTitle}>Genre</Text>
        <Text style={styles.text}>{movie.Genre}</Text>

        <Text style={styles.sectionTitle}>Director</Text>
        <Text style={styles.text}>{movie.Director}</Text>

        <Text style={styles.sectionTitle}>Cast</Text>
        <Text style={styles.text}>{movie.Actors}</Text>

        {movie.Writer && movie.Writer !== "N/A" && (
          <>
            <Text style={styles.sectionTitle}>Writer</Text>
            <Text style={styles.text}>{movie.Writer}</Text>
          </>
        )}

        <Text style={styles.sectionTitle}>Release Date</Text>
        <Text style={styles.text}>{movie.Released}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  poster: {
    width: "100%",
    height: 400, // Ajustado para un tamaño más apropiado
    borderRadius: 8, // Agregado para bordes redondeados
    marginBottom: 20, // Espacio entre la imagen y el contenido
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 10,
  },
  heartLarge: {
    fontSize: 32,
  },
  meta: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
    flexWrap: "wrap",
  },
  metaText: {
    color: "#999",
    fontSize: 14,
  },
  rating: {
    backgroundColor: "#2a2a2a",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  ratingText: {
    color: "#ffd700",
    fontWeight: "bold",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 15,
    marginBottom: 8,
  },
  plot: {
    color: "#ccc",
    fontSize: 15,
    lineHeight: 22,
  },
  text: {
    color: "#ccc",
    fontSize: 15,
  },
});
