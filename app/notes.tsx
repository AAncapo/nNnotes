import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  TouchableOpacity,
  useColorScheme,
  FlatList,
  Text,
  View,
  RefreshControl,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useNotesStore } from "@/store/useNotesStore";
import { Note } from "@/types";
import { isPlatformWeb } from "@/lib/utils";
import useTheme from "@/lib/themes";
import NoteCard from "@/components/NoteCard";
import NoteDetails from "./note/[id]";
import Settings from "./settings";

enum VIEW {
  NOTES = "notes",
  SETTINGS = "settings",
}

export default function Notes() {
  const colorScheme = useTheme(useColorScheme());
  const { view } = useLocalSearchParams<{
    view?: VIEW;
  }>();
  const {
    notes,
    updateNote,
    moveToTrash,
    getNoteByFolder,
    folders,
    selectedFolder,
    syncNotes,
    loading,
  } = useNotesStore();

  const folderName = useMemo(
    () =>
      !selectedFolder
        ? "Notas"
        : folders.find((f) => f.id === selectedFolder)?.name || "Notas.",
    [selectedFolder]
  );

  const filteredNotes = useMemo(() => {
    return getNoteByFolder(selectedFolder);
  }, [notes, selectedFolder, folders]);

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
          onDelete={moveToTrash}
          onLongPress={() =>
            updateNote(item.id, { isPinned: !item.isPinned }, false)
          }
        />
      );
    },
    [notes]
  );

  const onRefresh = async () => {
    await syncNotes();
  };

  const handleCreateNote = () => {
    if (isPlatformWeb) {
      router.setParams({ id: "new" });
    } else {
      router.push("/note/new");
    }
  };

  const openSettings = () => {
    if (isPlatformWeb) {
      router.setParams({
        view: VIEW.SETTINGS,
      });
    } else {
      router.push("/settings");
    }
  };

  console.log(`showing ${sortedNotes.length} from ${notes.length} notes...`);

  return (
    <GestureHandlerRootView className={`flex-1 ${isPlatformWeb && "flex-row"}`}>
      {/* Notes list */}
      {!view || view === VIEW.NOTES ? (
        <View
          className={` ${isPlatformWeb ? "w-3/12" : "flex-1"}`}
          style={{ backgroundColor: colorScheme?.background }}
        >
          <View className="p-2 pb-4 pt-4 gap-4">
            <View className="flex-row items-center justify-between p-2">
              <Text
                className={`text-5xl font-bold`}
                style={{
                  color:
                    selectedFolder !== "deleted"
                      ? colorScheme?.text
                      : "#ef4444",
                }}
              >
                {folderName}
              </Text>
              {/* Settings Button */}
              <TouchableOpacity
                className="rounded-full p-4 items-center justify-center"
                onPress={openSettings}
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
              contentContainerClassName={`px-4`}
              refreshControl={
                <RefreshControl refreshing={loading} onRefresh={onRefresh} />
              }
              maxToRenderPerBatch={8}
              initialNumToRender={8}
              windowSize={5}
              removeClippedSubviews={true}
              updateCellsBatchingPeriod={1000}
            />
          </View>

          {/* (Web) Create new note button */}
          {isPlatformWeb && selectedFolder !== "deleted" && (
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
          )}
        </View>
      ) : (
        <Settings />
      )}

      {isPlatformWeb && <NoteDetails />}

      {/* FAB */}
      {!isPlatformWeb && selectedFolder !== "deleted" && (
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
          <Ionicons name="add" size={28} color={colorScheme?.iconButton} />
        </TouchableOpacity>
      )}
    </GestureHandlerRootView>
  );
}
