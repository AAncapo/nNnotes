import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  TouchableOpacity,
  useColorScheme,
  FlatList,
  Text,
  View,
  RefreshControl,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNotesStore } from "@/store/useNotesStore";
import { Note } from "@/types";
import { isPlatformWeb } from "@/lib/utils";
import useTheme from "@/lib/themes";
import NoteCard from "@/components/NoteCard";
import NoteDetails from "./note/[id]";

export default function Notes() {
  const colorScheme = useTheme(useColorScheme());
  const marginTop = useSafeAreaInsets().top;
  const { notes, updateNote, getAllTags, syncNotes, loading } = useNotesStore();
  const [showDeleted, setShowDeleted] = useState<boolean>(false);

  const onRefresh = useCallback(async () => {
    await syncNotes();
  }, []);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => (showDeleted ? n.isDeleted : !n.isDeleted));
  }, [notes, showDeleted]);

  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      // Pinned notes come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // If both are pinned or both not pinned, sort by updatedAt (newest first)
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [filteredNotes]);

  const renderNoteCard = useCallback(
    ({ item }: { item: Note }) => {
      return (
        <NoteCard
          key={item.id}
          note={item}
          onDelete={(id) => updateNote(id, { isDeleted: true }, false)}
          onLongPress={() =>
            updateNote(item.id, { isPinned: !item.isPinned }, false)
          }
        />
      );
    },
    [notes]
  );

  const handleCreateNote = () => {
    if (isPlatformWeb) {
      router.setParams({ id: "new" });
    } else {
      router.push("/note/new");
    }
  };
  console.log(`showing ${notes.filter((n) => !n.isDeleted).length} notes...`);
  return (
    <GestureHandlerRootView className={`flex-1 flex-row`}>
      {/* Notes list */}
      <View
        className={` ${isPlatformWeb ? "w-3/12" : "flex-1"}`}
        style={{ backgroundColor: colorScheme?.background }}
      >
        <View className="p-2 pb-4 pt-4 gap-4" style={{ marginTop }}>
          <View className="flex-row items-center justify-between p-2">
            <Text
              className={`text-5xl font-bold`}
              style={{ color: colorScheme?.text }}
            >
              nNnotas
            </Text>
            <TouchableOpacity
              className="rounded-full p-4 items-center justify-center"
              onPress={() => router.push("/settings")}
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color={colorScheme?.icons}
              />
            </TouchableOpacity>
          </View>

          {/* <SearchBar onSubmit={addNote} /> */}
          {/* <View className="flex-row space-x-3">
            <View>
              <TouchableOpacity
                className={`${showDeleted ? "bg-gray-500" : "bg-gray-700"} p-2 px-4 gap-2 rounded-full flex-row items-center`}
                onPress={() => setShowDeleted(!showDeleted)}
              >
                <Ionicons name="trash-bin-outline" size={15} color="white" />
                <Text
                  className="text-center font-medium text-sm"
                  style={{ color: colorScheme?.text }}
                >
                  Papelera
                </Text>
              </TouchableOpacity>
            </View>
            {getAllTags().map((tag) => (
              <TouchableOpacity className="bg-gray-800">
                <Text
                  className="text-center"
                  style={{ color: colorScheme?.text }}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View> */}
        </View>
        <View className="flex-1">
          <FlatList
            data={sortedNotes}
            renderItem={renderNoteCard}
            keyExtractor={(item) => item.id}
            alwaysBounceVertical
            keyboardShouldPersistTaps="handled"
            contentContainerClassName={`flex-grow px-4`}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={onRefresh} />
            }
          />
        </View>

        {/* (Web) Create new note button */}
        {isPlatformWeb ? (
          <View className="p-8">
            <TouchableOpacity
              onPress={handleCreateNote}
              className="p-4 rounded-lg"
              style={{ backgroundColor: colorScheme?.button }}
            >
              <Text
                className="text-xl text-center font-bold"
                style={{ color: "black" }}
              >
                Crear nueva nota
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {isPlatformWeb && <NoteDetails />}

      {/* FAB */}
      {!isPlatformWeb && (
        <TouchableOpacity
          activeOpacity={0.3}
          style={{
            backgroundColor: colorScheme?.button,
            shadowColor: colorScheme?.button,
            shadowOffset: {
              width: 0,
              height: 0,
            },
            elevation: 5,
            shadowOpacity: 0.7,
            shadowRadius: 10,
          }}
          className={`absolute bottom-16 h-20 w-20 items-center justify-center self-center rounded-full`}
          onPress={handleCreateNote}
        >
          <Ionicons
            name="add"
            size={28}
            color={useColorScheme() === "dark" ? "black" : "white"}
          />
        </TouchableOpacity>
      )}
    </GestureHandlerRootView>
  );
}
