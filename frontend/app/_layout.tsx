// frontend/app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  //busca en el storaqge la clave, si no existe pues null
  useEffect(() => {
    AsyncStorage.getItem("authToken").then((token) => {
      setHasToken(!!token); //actuializa el estado
    });
  }, []);

  if (hasToken === null) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!hasToken ? (
        <Stack.Screen name="(auth)/login" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}

//si tiene token muesta tabs
//si no muestra login
