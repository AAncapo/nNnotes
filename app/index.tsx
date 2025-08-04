import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

import { useNotesStore } from "@/store/useNotesStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function Index() {
  const initializeUser = useAuthStore((state) => state.initializeStore);
  const { initializeNotes, loading } = useNotesStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeNotes().then(() => {
      setInitialized(true);
      initializeUser();
    });
  }, []);

  return loading || !initialized ? (
    <ActivityIndicator size={30} />
  ) : (
    <Redirect href="/notes" />
  );
}
