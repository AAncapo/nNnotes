import { create } from "zustand";
import { ColorTheme } from "@/types";
import { getData, storeData } from "@/lib/async-storage";
import { Alert, ColorSchemeName } from "react-native";

const STORAGE_KEY = "preferences";

interface PreferencesState {
  loading: boolean;
  theme: ColorTheme;
  experimentalEnabled: boolean;
  setTheme: (newTheme: ColorTheme) => Promise<void>;
  initializePreferences: () => Promise<void>;
}

const usePreferencesStore = create<PreferencesState>()((set, get) => ({
  loading: false,
  theme: "light",
  experimentalEnabled: false,

  setTheme: async (theme: ColorTheme) => {
    set({ theme });
    await storeData(STORAGE_KEY, { ...get(), theme });
  },

  initializePreferences: async () => {
    try {
      set({ loading: true });

      const savedPrefs = await getData(STORAGE_KEY);
      if (savedPrefs) set(savedPrefs);
    } catch (error: any) {
      Alert.alert("Error loading saved preferences!", error.message);
    } finally {
      set({ loading: false });
    }
  },
}));

export default usePreferencesStore;
