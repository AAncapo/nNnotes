import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

import { useNotesStore } from "@/store/useNotesStore";

export default function Index() {
  const { initializeNotes, loading } = useNotesStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initializeNotes().then(() => setInitialized(true));
  }, []);

  return loading || !initialized ? <ActivityIndicator size={30} /> : <Redirect href="/notes" />;
}
