import { ColorSchemeName, Platform } from "react-native";

export const isPlatformWeb = Platform.OS === "web";

export const getIconColor = (
  colorScheme: ColorSchemeName,
  disabled?: boolean
) => (disabled ? "#eee" : colorScheme === "dark" ? "white" : "#1f2937");

export const getRandomID = () =>
  `${Date.now() + Math.abs(Math.random() * 1000)}`;

export function convertAndFormatUTC(utcDateTime: string, options = {}) {
  try {
    const date = new Date(utcDateTime);
    if (isNaN(date.getTime())) return null;

    // Default formatting options
    const defaultOptions = {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Merge user options with defaults
    const formatOptions = {
      ...defaultOptions,
      ...options,
    } as Intl.DateTimeFormatOptions;

    return new Intl.DateTimeFormat(navigator.language, formatOptions).format(
      date
    );
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
