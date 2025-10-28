//app/(auth)/login.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import {
  useRouter,
  useLocalSearchParams,
  useRootNavigationState,
} from "expo-router";
import { API_CONFIG } from "../../constants/Config";
import { makeRedirectUri } from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

//caputa los tokens despues del; redorect
export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const navigationState = useRootNavigationState();

  //despues del redirect de gugle verifica que el router este listo

  useEffect(() => {
    if (!navigationState?.key) return;

    let token = params?.token as string;
    //intenta leer el token del url
    if (Platform.OS === "web" && !token) {
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get("token") || "";
    }
    //
    if (token && typeof token === "string") {
      console.log("Token received:", token.substring(0, 20) + "...");
      AsyncStorage.setItem("authToken", token).then(() => {
        //limpiar el url  para que sea local 8081
        if (Platform.OS === "web") {
          window.history.replaceState({}, "", "/");
        }
        router.replace("/(tabs)/search");
      });
    }
  }, [params, navigationState, router]);
  //si la regristre en el client
  const webRedirectUrl = "http://localhost:8081";
  const nativeRedirectUrl = makeRedirectUri({
    scheme: "movietracker",
    path: "auth/login",
  });
  // si es web "http://localhost:8081"
  //si esos "movietracker://auth/login"
  const handleGoogleLogin = async () => {
    const finalRedirectUrl =
      Platform.OS === "web" ? webRedirectUrl : nativeRedirectUrl;
    const authUrl = `${
      API_CONFIG.BASE_URL
    }/auth/google?redirect_uri=${encodeURIComponent(finalRedirectUrl)}`;

    console.log("Auth URL:", authUrl);
    console.log("Redirect URL:", finalRedirectUrl);

    //usuario hace click se va a window loation href osea raiway app auth etc
    // navegador a a mi backend railway y el back redirige a google auth
    if (Platform.OS === "web") {
      window.location.href = authUrl;
    } else {
      // iOS/Android
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        finalRedirectUrl
      );
      // lo que dios quiera
      console.log("Auth result:", result);

      //si funciona pues...
      //agarra el token lo guarda usuario hace click webbrowser are ion ap safari se va a railway
      //back te lo lleva a auth
      // usuario acepta permisios google redirige a railway app auth google etcc
      //backend procesa y l;leva. amovie auth login
      // ios ve movietracker/// y ciera safari
      //app aarra el result .url aextrae el toke n y lo guarda en async
      //lleva. a tabs search
      if (result.type === "success" && result.url) {
        // Extraer token de la URL de retorno
        const url = new URL(result.url);
        const token = url.searchParams.get("token");

        if (token) {
          console.log(
            "Token extracted from URL:",
            token.substring(0, 20) + "..."
          );
          await AsyncStorage.setItem("authToken", token);
          router.replace("/(tabs)/search");
        } else {
          console.error("No token in redirect URL");
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/logo.png")} style={styles.logo} />
      <Text style={styles.title}>Movie Tracker</Text>
      <Text style={styles.subtitle}>Track your favorite movies</Text>

      {!params?.token && (
        <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

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
