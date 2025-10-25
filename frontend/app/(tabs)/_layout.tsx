//frontend/app/(tabs)/_layout.tsx

import { Text } from "react-native";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopColor: "#2a2a2a",
        },
        tabBarActiveTintColor: "#4285F4",
        tabBarInactiveTintColor: "#666",
      }}
    >
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>🔍</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>❤️</Text>
          ),
        }}
      />
    </Tabs>
  );
}
