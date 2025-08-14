import { create } from "zustand";
import { ColorTheme } from "@/types";
import { getData, storeData } from "@/lib/async-storage";
import { Alert } from "react-native";

const STORAGE_KEY = "preferences";

type REC_QUALITY = "low" | "high";

interface PreferencesState {
  loading: boolean;
  theme: ColorTheme;
  experimentalEnabled: boolean;
  recordingQuality: REC_QUALITY;
  setTheme: (newTheme: ColorTheme) => Promise<void>;
  setRecordingQuality: (recQuality: REC_QUALITY) => Promise<void>;
  initializePreferences: () => Promise<void>;
}

const usePreferencesStore = create<PreferencesState>()((set, get) => ({
  loading: false,
  theme: "light",
  experimentalEnabled: false,
  recordingQuality: "low",

  setTheme: async (theme: ColorTheme) => {
    set({ theme });
    await storeData(STORAGE_KEY, { ...get(), theme });
  },

  setRecordingQuality: async (recordingQuality) => {
    set({ recordingQuality });
    await storeData(STORAGE_KEY, { ...get(), recordingQuality });
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
