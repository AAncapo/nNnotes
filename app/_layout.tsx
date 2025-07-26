import useTheme from "@/lib/themes";
import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Layout() {
  const colorScheme = useTheme(useColorScheme());
  const { top, bottom } = useSafeAreaInsets();

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
          contentStyle: {
            backgroundColor: "#fff",
            marginTop: top,
            marginBottom: bottom,
          },
          headerShown: false,
          navigationBarColor: colorScheme?.background,
        }}
      >
        <Stack.Screen
          name="note/[id]"
          options={{
            freezeOnBlur: true,
            navigationBarColor: colorScheme?.secondary,
          }}
        />
        <Stack.Screen
          name="notes"
          options={{
            freezeOnBlur: true,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            freezeOnBlur: true,
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            freezeOnBlur: true,
            navigationBarColor: colorScheme?.secondary,
          }}
        />
      </Stack>
    </>
  );
}
