import useTheme from "@/lib/themes";
import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

export default function Layout() {
  const colorScheme = useTheme(useColorScheme());

  return (
    <>
      <StatusBar
        style={useColorScheme() === "dark" ? "light" : "dark"}
        backgroundColor={colorScheme?.background}
      />
      <Stack
        screenOptions={{
          animation: "fade_from_bottom", // Animación más ligera
          animationDuration: 150, // Reducir duración de la animación
          contentStyle: { backgroundColor: "#fff" },
          headerShown: false,
          navigationBarColor: colorScheme?.background,
        }}
      >
        <Stack.Screen
          name="note/[id]"
          options={{
            freezeOnBlur: true, // Mejorar rendimiento
          }}
        />
        <Stack.Screen
          name="notes"
          options={{
            freezeOnBlur: true, // Mejorar rendimiento
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            freezeOnBlur: true, // Mejorar rendimiento
          }}
        />
      </Stack>
      {/* <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: colorScheme?.secondary,
          },
          headerTintColor: colorScheme?.secondary,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      /> */}
    </>
  );
}
