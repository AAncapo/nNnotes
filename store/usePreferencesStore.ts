import { Alert } from "react-native";

import { create } from "zustand";
import { ThemeOptions } from "@/types";
import { getData, storeData } from "@/lib/async-storage";

const STORAGE_KEY = "preferences";

type REC_QUALITY = "low" | "high";

interface PreferencesState {
  loading: boolean;
  theme: ThemeOptions;
  experimentalEnabled: boolean;
  recordingQuality: REC_QUALITY;
  setTheme: (newTheme: ThemeOptions) => Promise<void>;
  setRecordingQuality: (recQuality: REC_QUALITY) => Promise<void>;
  initializePreferences: () => Promise<void>;
}

const usePreferencesStore = create<PreferencesState>()((set, get) => ({
  loading: false,
  theme: ThemeOptions.DEVICE,
  experimentalEnabled: false,
  recordingQuality: "low",

  setTheme: async (theme: ThemeOptions) => {
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
