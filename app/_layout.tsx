import useTheme from "@/hooks/useTheme";
import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Layout() {
  const { colors, theme } = useTheme();
  const { top, bottom } = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        style={theme === "dark" ? "light" : "dark"}
        backgroundColor={colors.background}
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
          navigationBarColor: colors.background,
        }}
      >
        <Stack.Screen
          name="note/[id]"
          options={{
            freezeOnBlur: true,
            navigationBarColor: colors.secondary,
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
            navigationBarColor: colors.secondary,
          }}
        />
      </Stack>
    </>
  );
}
