// frontend/app/(auth)/login.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router"; // 1. Importa useRouter
import { API_CONFIG } from "../../constants/Config";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter(); // 2. Obtén la instancia del router

  const handleGoogleLogin = async () => {
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${API_CONFIG.BASE_URL}/auth/google`,
        "http://localhost:8081"
      );

      if (result.type === "success") {
        // 3. Navega a la pantalla principal en lugar de solo imprimir en consola
        router.replace("/(tabs)/search");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* ...el resto de tu componente JSX se queda igual... */}
      <Image source={require("../../assets/logo.png")} style={styles.logo} />
      <Text style={styles.title}>Movie Tracker</Text>
      <Text style={styles.subtitle}>Track your favorite movies</Text>

      <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

// ...los estilos se quedan igual...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#4285F4",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
