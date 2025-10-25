// frontend/app/(tabs)/search.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import { movieAPI } from "../../services/api";
import { useRouter } from "expo-router";
import { SearchBar } from "../../components/SearchBar";
import axios from "axios";
import { Movie } from "../../types";
import { API_CONFIG } from "../../constants/Config";
import { useFocusEffect } from "@react-navigation/native";
const GENRES = [
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Thriller",
  "Romance",
  "Animation",
];

const POPULAR_MOVIES = [
  "The Shawshank Redemption",
  "The Godfather",
  "The Dark Knight",
  "Pulp Fiction",
  "Forrest Gump",
  "Inception",
  "Fight Club",
  "The Matrix",
];

const POPULAR_SERIES = [
  "Breaking Bad",
  "Game of Thrones",
  "The Sopranos",
  "The Wire",
  "Friends",
  "Stranger Things",
  "The Office",
  "Better Call Saul",
];

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const cardWidth = isWeb ? width / 4 - 30 : width / 2 - 20;

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularSeries, setPopularSeries] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [activeTab, setActiveTab] = useState<"movies" | "series">("movies");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPopularContent();
    loadUserFavorites();
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      loadUserFavorites();
    }, [])
  );

  const loadUserFavorites = async () => {
    try {
      const data = await movieAPI.getFavorites();
      const favoriteIds = new Set(data.map((f) => f.movie_id));
      setFavorites(favoriteIds);
    } catch (e) {
      console.error("Error loading favorites:", e);
    }
  };
  const loadPopularContent = async () => {
    try {
      const moviePromises = POPULAR_MOVIES.map((title) =>
        axios.get("http://www.omdbapi.com/", {
          params: {
            apikey: API_CONFIG.MOVIE_API_KEY,
            t: title,
            type: "movie",
          },
        })
      );

      const seriesPromises = POPULAR_SERIES.map((title) =>
        axios.get("http://www.omdbapi.com/", {
          params: {
            apikey: API_CONFIG.MOVIE_API_KEY,
            t: title,
            type: "series",
          },
        })
      );

      const movieResults = await Promise.all(moviePromises);
      const seriesResults = await Promise.all(seriesPromises);

      setPopularMovies(
        movieResults.map((r) => r.data).filter((m) => m.Response === "True")
      );
      setPopularSeries(
        seriesResults.map((r) => r.data).filter((s) => s.Response === "True")
      );
    } catch (err) {
      console.error("Failed to load popular content:", err);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get("http://www.omdbapi.com/", {
        params: {
          apikey: API_CONFIG.MOVIE_API_KEY,
          s: query,
          type: activeTab === "movies" ? "movie" : "series",
        },
      });

      setMovies(response.data.Search || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreSearch = async (genre: string) => {
    setSelectedGenre(genre);
    setLoading(true);
    try {
      const response = await axios.get("http://www.omdbapi.com/", {
        params: {
          apikey: API_CONFIG.MOVIE_API_KEY,
          s: genre,
          type: activeTab === "movies" ? "movie" : "series",
        },
      });

      setMovies(response.data.Search || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (item: Movie) => {
    const isCurrentlyFavorite = favorites.has(item.imdbID);

    try {
      if (isCurrentlyFavorite) {
        await movieAPI.removeFavorite(item.imdbID);
      } else {
        await movieAPI.addFavorite({
          movieId: item.imdbID,
          title: item.Title,
          posterPath: item.Poster,
          releaseDate: item.Year,
        });
      }

      setFavorites((prev) => {
        const newFavorites = new Set(prev);
        if (isCurrentlyFavorite) {
          newFavorites.delete(item.imdbID);
        } else {
          newFavorites.add(item.imdbID);
        }
        return newFavorites;
      });
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  const renderMovieCard = (item: Movie) => (
    <View style={[styles.card, { width: cardWidth }]}>
      <TouchableOpacity onPress={() => router.push(`/movie/${item.imdbID}`)}>
        <Image
          source={{
            uri:
              item.Poster !== "N/A"
                ? item.Poster
                : "https://via.placeholder.com/300x450",
          }}
          style={styles.poster}
          resizeMode="cover"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.heartButton}
        onPress={() => toggleFavorite(item)}
      >
        <Text style={styles.heart}>
          {favorites.has(item.imdbID) ? "❤️" : "🤍"}
        </Text>
      </TouchableOpacity>

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.Title}
        </Text>
        <Text style={styles.year}>{item.Year}</Text>
      </View>
    </View>
  );

  const displayContent =
    query || selectedGenre
      ? movies
      : activeTab === "movies"
      ? popularMovies
      : popularSeries;

  return (
    // Contenedor principal
    <View style={styles.container}>
      {/* --- 1. ENCABEZADO FIJO --- */}
      <View style={styles.headerContainer}>
        <SearchBar
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setSelectedGenre("");
          }}
          onSubmit={handleSearch}
          placeholder={`Search ${activeTab}...`}
        />

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "movies" && styles.activeTab]}
            onPress={() => {
              setActiveTab("movies");
              setMovies([]);
              setQuery("");
              setSelectedGenre("");
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "movies" && styles.activeTabText,
              ]}
            >
              Movies
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "series" && styles.activeTab]}
            onPress={() => {
              setActiveTab("series");
              setMovies([]);
              setQuery("");
              setSelectedGenre("");
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "series" && styles.activeTabText,
              ]}
            >
              Series
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.genreContainer}
          contentContainerStyle={styles.genreContent}
        >
          {GENRES.map((genre) => (
            <TouchableOpacity
              key={genre}
              style={[
                styles.genreButton,
                selectedGenre === genre && styles.selectedGenre,
              ]}
              onPress={() => handleGenreSearch(genre)}
            >
              <Text
                style={[
                  styles.genreText,
                  selectedGenre === genre && styles.selectedGenreText,
                ]}
              >
                {genre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* --- 2. LISTA DESPLAZABLE --- */}
      <FlatList
        data={displayContent}
        keyExtractor={(item, index) => item.imdbID || `${item.Title}-${index}`}
        numColumns={isWeb ? 4 : 2}
        key={isWeb ? "web-4" : "mobile-2"}
        renderItem={({ item }) => renderMovieCard(item)}
        contentContainerStyle={styles.listContent}
        // El encabezado de la lista ahora SOLO contiene el título y el indicador
        ListHeaderComponent={
          <>
            {!query && !selectedGenre && (
              <Text style={styles.sectionTitle}>
                {activeTab === "movies" ? "Popular Movies" : "Popular Series"}
              </Text>
            )}
            {loading && <ActivityIndicator size="large" color="#fff" />}
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#1a1a1a",
  },
  headerContainer: {
    padding: 15,
    paddingBottom: 0,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 15,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#4285F4",
  },
  tabText: {
    color: "#999",
    fontSize: 16,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
  genreContainer: {
    marginBottom: 15,
    maxHeight: 50,
    flexGrow: 0,
  },
  genreContent: {
    paddingRight: 15,
  },
  genreButton: {
    backgroundColor: "#2a2a2a",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedGenre: {
    backgroundColor: "#e50914",
  },
  genreText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedGenreText: {
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    margin: 5,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  poster: {
    width: "100%",
    aspectRatio: 2 / 3,
  },
  heartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  heart: {
    fontSize: 20,
  },
  cardInfo: {
    padding: 10,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  year: {
    color: "#999",
    fontSize: 12,
  },
});
