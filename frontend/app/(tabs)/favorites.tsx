// frontend/app/(tabs)/favorites.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { movieAPI } from "../../services/api";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const cardWidth = isWeb ? width / 4 - 30 : width / 2 - 20;

interface Favorite {
  movie_id: string;
  title: string;
  poster_path: string;
  release_date: string;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = async () => {
    try {
      const data = await movieAPI.getFavorites();
      setFavorites(data);
    } catch (e) {
      console.error("Error fetching favorites:", e);
      setFavorites([]);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (movieId: string) => {
    try {
      await movieAPI.removeFavorite(movieId);
      setFavorites((prev) => prev.filter((f) => f.movie_id !== movieId));
    } catch (e) {
      console.error("Error removing favorite:", e);
    }
  };

  const renderFavoriteCard = (item: Favorite) => (
    <View style={[styles.card, { width: cardWidth }]}>
      <TouchableOpacity onPress={() => router.push(`/movie/${item.movie_id}`)}>
        <Image
          source={{
            uri:
              item.poster_path !== "N/A"
                ? item.poster_path
                : "https://via.placeholder.com/300x450",
          }}
          style={styles.poster}
          resizeMode="cover"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.heartButton}
        onPress={() => handleRemoveFavorite(item.movie_id)}
      >
        <Text style={styles.heart}>❤️</Text>
      </TouchableOpacity>

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.year}>{item.release_date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Favorites</Text>
      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            Add movies by tapping the heart icon
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.movie_id}
          numColumns={isWeb ? 4 : 2}
          key={isWeb ? "web-4" : "mobile-2"}
          renderItem={({ item }) => renderFavoriteCard(item)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#1a1a1a",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    marginTop: 10,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
  },
  listContent: {
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
