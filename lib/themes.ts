import { ColorSchemeName } from "react-native";

export default function useTheme(colorScheme: ColorSchemeName) {
  if (!colorScheme) return;
  return Colors[colorScheme];
}

const Colors = {
  dark: {
    background: "#111827",
    secondary: "#030712",
    actionButton: "white",
    iconButton: "black",
    text: "#f8fafc",
    icons: "white",
    checkbox: "white",
  },
  light: {
    background: "#f8fafc",
    secondary: "white",
    text: "black",
    icons: "black",
    iconButton: "white",
    actionButton: "black",
    checkbox: "black",
  },
};
