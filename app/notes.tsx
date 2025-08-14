import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  TouchableOpacity,
  FlatList,
  Text,
  View,
  RefreshControl,
  Alert,
} from "react-native";

import { Note } from "@/types";
import { isPlatformWeb } from "@/lib/utils";
import useTheme from "@/hooks/useTheme";
import NoteDetails from "./note/[id]";
import Settings from "./settings";
import NoteCard from "@/components/NoteCard";
import Toolbar from "@/components/Toolbar";
import SearchBar from "@/components/common/SearchBar";
import { useNotesStore } from "@/store/useNotesStore";

enum VIEW {
  NOTES = "notes",
  SETTINGS = "settings",
}

export default function Notes() {
  const { colors } = useTheme();
  const { view } = useLocalSearchParams<{
    view?: VIEW;
  }>();
  const {
    notes,
    updateNote,
    deleteNote,
    moveToFolder,
    getNoteByFolder,
    folders,
    tags,
    selectedFolder,
    syncNotes,
    loading,
  } = useNotesStore();
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | undefined>();
  const [queryValue, setQueryValue] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const folderName = useMemo(
    () =>
      !selectedFolder
        ? "Notas"
        : folders.find((f) => f.id === selectedFolder)?.name || "Notas.",
    [selectedFolder]
  );

  const filteredNotes = useMemo(() => {
    const byFolder = getNoteByFolder(selectedFolder || undefined);
    let fnotes = byFolder;

    if (selectedTags.length > 0)
      fnotes = fnotes.filter((n) =>
        n.tags?.some((t) => selectedTags.includes(t))
      );

    if (queryValue !== "")
      fnotes = fnotes.filter((n) =>
        n.title.toLowerCase().includes(queryValue.toLowerCase())
      );

    return fnotes;
  }, [notes, selectedFolder, folders, queryValue]);

  const sortedNotes = useMemo(() => {
    console.log(
      `showing ${filteredNotes.length} from ${notes.length} notes at folder: ${selectedFolder}`
    );
    return [...filteredNotes].sort((a, b) => {
      // Pinned notes come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // If both are pinned or both not pinned, sort by updatedAt (newest first)
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [filteredNotes]);

  const handleNotePressed = (id: string) => {
    // open note
    isPlatformWeb
      ? router.setParams({ id: id })
      : router.push({
          pathname: "/note/[id]",
          params: { id: id },
        });
  };

  const handleNoteLongPress = (id: string) => {
    setToolbarVisible(true);
    setSelectedNote(id);
  };

  // TODO: use swipeable like AppleNotes (left for pin / right for folder, delete)
  //  https://docs.swmansion.com/react-native-gesture-handler/docs/components/reanimated_swipeable
  const renderNoteCard = useCallback(
    ({ item }: { item: Note }) => {
      return (
        <NoteCard
          key={item.id}
          note={item}
          onPress={handleNotePressed}
          onLongPress={handleNoteLongPress}
        />
      );
    },
    [notes]
  );

  const onRefresh = async () => await syncNotes();

  const handleCreateNote = () => {
    if (isPlatformWeb) {
      router.setParams({ id: "new" });
    } else {
      router.push("/note/new");
    }
  };

  const hideToolbar = () => {
    setToolbarVisible(false);
    setSelectedNote(undefined);
  };

  const handleDeleteNote = () => {
    if (!selectedNote) return;

    Alert.alert(
      "Confirm delete note",
      "Do you want to delete the selected note?",
      [
        { text: "Cancel" },
        {
          text: "Delete",
          onPress: async () => {
            await deleteNote(selectedNote);
            // moveToFolder(selectedNote, DELETED_FOLDER_ID);
            hideToolbar();
          },
        },
      ]
    );
  };

  const handleTogglePinned = async () => {
    if (!selectedNote) return;

    updateNote(
      selectedNote!,
      {
        isPinned: !filteredNotes.find((n) => n.id === selectedNote)!.isPinned,
      },
      false
    );
    hideToolbar();
  };

  console.log(isPlatformWeb);
  return (
    <View
      className={`flex-1 ${isPlatformWeb && "flex-row"}`}
      style={{ backgroundColor: colors.background }}
    >
      {/* Notes list */}
      {!view || view === VIEW.NOTES ? (
        <View
          className={` ${isPlatformWeb ? "w-3/12" : "flex-1"} relative`}
          style={{ backgroundColor: colors.background }}
        >
          <View className="p-2 pt-4 gap-2">
            <View className="flex-row items-center justify-between px-2">
              {/* Folder */}
              <Text
                className={`text-5xl font-bold`}
                style={{
                  color: selectedFolder !== "deleted" ? colors.text : "#ef4444",
                }}
              >
                {folderName}
              </Text>
              {/* Settings Button */}
              <TouchableOpacity
                className="rounded-full p-4 items-center justify-center"
                onPress={() => {
                  if (isPlatformWeb) {
                    router.setParams({
                      view: VIEW.SETTINGS,
                    });
                  } else {
                    router.push("/settings");
                  }
                }}
              >
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={colors.icon}
                />
              </TouchableOpacity>
            </View>

            {/* TODO: poner los tags dentro del container del searchbar (row) hacer un boton con el icono de search q onPress esconde los tags y expande la searchbar */}
            <View className="px-2">
              <SearchBar value={queryValue} onQueryUpdate={setQueryValue} />
              {/* <TagList tags={tags} onSelectedChange={setSelectedTags} /> */}
            </View>
          </View>
          <View className="flex-1">
            <FlatList
              data={sortedNotes}
              renderItem={renderNoteCard}
              keyExtractor={(item) => item.id}
              alwaysBounceVertical
              keyboardShouldPersistTaps="handled"
              contentContainerClassName={`px-4 pb-200`}
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
                style={{ backgroundColor: colors.button }}
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
          {/* Toolbar */}
          {toolbarVisible && (
            <Toolbar
              key={selectedNote}
              isPinned={
                selectedNote
                  ? notes.find((n) => n.id === selectedNote)?.isPinned || false
                  : false
              }
              onClose={hideToolbar}
              handleDelete={handleDeleteNote}
              handlePin={handleTogglePinned}
              handleTags={() => {}}
            />
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
            backgroundColor: colors.button,
            shadowColor: colors.button,
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
          <Ionicons name="add" size={28} color={colors.iconButton} />
        </TouchableOpacity>
      )}
    </View>
  );
}
