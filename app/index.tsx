import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { useNotesStore } from "@/store/useNotesStore";
import { useAuthStore } from "@/store/useAuthStore";
import usePreferencesStore from "@/store/usePreferencesStore";

export default function Index() {
  const initializeUser = useAuthStore((state) => state.initializeStore);
  const initPrefs = usePreferencesStore((state) => state.initializePreferences);
  const { initializeNotes, loading } = useNotesStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeNotes().then(() => {
      setInitialized(true);
      initializeUser();
      initPrefs();
    });
  }, []);

  return loading || !initialized ? (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size={30} />
    </View>
  ) : (
    <Redirect href="/notes" />
  );
}
