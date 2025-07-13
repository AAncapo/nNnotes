import { ColorSchemeName } from "react-native";

export default function useTheme(colorScheme: ColorSchemeName) {
  if (!colorScheme) return;
  return Colors(colorScheme);
}

const Colors = (colorScheme: ColorSchemeName) => {
  return {
    background: colorScheme === "dark" ? "#111827" : "#f8fafc",
    secondary: colorScheme === "dark" ? "#030712" : "white",
    button: colorScheme === "dark" ? "white" : "black",
    buttonText: colorScheme === "dark" ? "black" : "white",
    iconButton: colorScheme === "dark" ? "black" : "white",
    text: colorScheme === "dark" ? "#f8fafc" : "black",
    icons: colorScheme === "dark" ? "white" : "black",
    checkbox: colorScheme === "dark" ? "white" : "black",
  };
};
