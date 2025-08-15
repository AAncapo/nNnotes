import { useColorScheme } from "react-native";

import { ColorTheme, ThemeOptions } from "@/types";
import usePreferencesStore from "@/store/usePreferencesStore";

export default function useTheme() {
  const { theme, setTheme } = usePreferencesStore();
  const colorScheme = useColorScheme();

  const getTheme = (): ColorTheme => {
    return theme === ThemeOptions.DEVICE ? colorScheme || "light" : theme;
  };

  return { colors: Colors(getTheme()), theme: getTheme(), setTheme };
}

const Colors = (theme: ColorTheme) => {
  return {
    background: theme === "dark" ? "#111827" : "white",
    secondary: theme === "dark" ? "#030712" : "#f8fafc",
    button: theme === "dark" ? "white" : "black",
    buttonText: theme === "dark" ? "black" : "white",
    iconButton: theme === "dark" ? "black" : "white",
    text: theme === "dark" ? "#f8fafc" : "black",
    icon: theme === "dark" ? "white" : "black",
    iconSecondary: "gray",
    checkbox: theme === "dark" ? "white" : "black",
    separator:
      theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0, 0, 0, 0.1)",
    searchbar: "rgba(156, 163, 175, 0.2)",
    noteCard: theme === "dark" ? "#1f2937" : "#e5e7eb",
  };
};
