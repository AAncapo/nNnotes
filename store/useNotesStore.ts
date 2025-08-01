/* eslint-disable prettier/prettier */

import { create } from "zustand";

import { ContentBlock, ContentType, Note, NotesFolder } from "@/types";
import { getData, storeData } from "@/lib/async-storage";
import { supabase } from "@/lib/supabase";
import { Alert } from "react-native";
import { useAuthStore } from "./useAuthStore";
import { router } from "expo-router";
import {
  checkFileInCache,
  saveFileToCache,
  SUPABASE_BUCKET,
} from "@/lib/supabase-storage";

interface NotesState {
  notes: Note[];
  folders: NotesFolder[];
  selectedFolder: string | null;
  loading: boolean;
  setNotes: (notes: Note[]) => Promise<void>;
  addNote: (
    note: Omit<Note, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateNote: (
    id: string,
    note: Partial<Note>,
    setUpdatedAt?: boolean
  ) => Promise<void>;
  moveToTrash: (id: string) => Promise<void>;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
  getNoteByFolder: (folderId: string | null) => Note[];
  setSelectedFolder: (selectedFolder: string | null) => void;
  getAllTags: () => string[];
  initializeNotes: () => Promise<void>;
  syncNotes: () => Promise<void>;
}

const DEFAULT_FOLDERS = [
  { id: "deleted", name: "Trash", notes: [] },
] as NotesFolder[];

export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  folders: [...DEFAULT_FOLDERS],
  selectedFolder: null,
  loading: false,

  setNotes: async (notes) => {
    // let folders = [...get().folders];

    // const notes = newNotes.map((n) => {
    //   // Add to deleted folder if necessary
    //   if (
    //     n.isDeleted &&
    //     !folders
    //       .find((f) => f.id === "deleted")!
    //       .notes.some((dnId) => dnId === n.id)
    //   ) {
    //     !folders.find((f) => f.id === "deleted")!.notes.push(n.id);
    //   }
    //   return n;
    // });

    set({ notes });
    await storeData("notes", { ...get(), notes });
  },

  addNote: async (note) => {
    // console.log("add note");

    const updatedContent = await saveNewFilesInCache(note.content);

    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      content: [...updatedContent],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    get().setNotes([...get().notes, newNote]);
  },

  updateNote: async (id, note, setUpdatedAt = true) => {
    // console.log("update note");
    let updatedContent = [] as ContentBlock[];
    if (note.content) {
      updatedContent = await saveNewFilesInCache(note.content);
    }
    get().setNotes([
      ...get().notes.map((n) =>
        n.id === id
          ? {
              ...n,
              ...note,
              content: [...updatedContent],
              updatedAt: setUpdatedAt ? new Date().toISOString() : n.updatedAt,
            }
          : n
      ),
    ]);
  },

  moveToTrash: async (id) => {
    // Remueve la nota de cualquier folder dnde se encuentre
    // y la añade al deleted folder
    const folders = get().folders.map((f) => {
      if (f.id !== "deleted") f.notes.filter((n) => n !== id);
      else {
        if (!f.notes.includes(id)) {
          f.notes.push(id);
        }
      }

      return f;
    });

    set({ folders });
    await storeData("notes", { ...get(), folders });
  },

  deleteNote: (id) => {
    get().setNotes(get().notes.filter((n) => n.id !== id));
  },

  setSelectedFolder: (selectedFolder) => {
    set({ selectedFolder });
  },

  getNote: (id) => get().notes.find((n) => n.id === id),

  getNoteByFolder: (folderId) => {
    const folder = folderId
      ? get().folders.find((f) => f.id === folderId)
      : null;

    // by default returns all not deleted notes
    if (!folder) {
      const deletedFolder = get().folders.find((f) => f.id === "deleted");
      return get().notes.filter(
        (n) => !deletedFolder!.notes.some((dn) => dn === n.id)
      );
    }

    return folder.notes
      .map((id) => get().notes.find((n) => n.id === id))
      .filter((n) => n !== undefined);
  },

  getAllTags: () => {
    let tags: string[] = [];
    const notes = get().notes;
    for (const n of notes) {
      if (!n.tags) continue;
      for (const t of n.tags) {
        if (!tags.includes(t.trim())) tags.push(t);
      }
    }
    return tags;
  },

  initializeNotes: async () => {
    try {
      set({ loading: true });
      const data = await getData("notes");
      if (data) {
        set({
          ...get(),
          loading: false,
          notes: [...data.notes],
          folders: [...data.folders],
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      set({ loading: false });
    }
  },

  syncNotes: async () => {
    try {
      set({ loading: true });

      const user = await useAuthStore.getState().getUser();
      if (!user) {
        Alert.alert(
          "Usuario no autenticado",
          "Necesita estar autenticado para sincronizar",
          [
            { text: "cancelar" },
            {
              text: "iniciar sesión",
              onPress: () => router.push("/signin"),
            },
          ]
        );
        return;
      }

      const { data, error } = await supabase
        .from("notes")
        .select("id, updated_at");

      if (error) throw new Error(error.message);
      if (data) {
        let notesToFetch = [];
        let notesToUpsert: Note[] = [];

        const localNotes = get().notes;
        const remoteNotes = data;

        let fetchUpdated = 0;
        let fetchNew = 0;

        // Check remote notes that need to be fetched
        for (const remoteNote of remoteNotes) {
          const localNote = localNotes.find((n) => n.id === remoteNote.id);

          if (!localNote) {
            // Note only exists on server
            notesToFetch.push(remoteNote);
            fetchNew++;
            continue;
          } else if (
            new Date(remoteNote.updated_at) > new Date(localNote.updatedAt)
          ) {
            // Remote version is newer
            notesToFetch.push(remoteNote);
            fetchUpdated++;
            console.log(
              `localNote: ${new Date(localNote.updatedAt)} -- remote: ${new Date(remoteNote.updated_at)}`
            );
          }
        }

        let upsertNew = 0;
        let upsertUpdated = 0;

        // Check local notes that need upserted
        for (const localNote of localNotes) {
          const remoteNote = remoteNotes.find((n) => n.id === localNote.id);

          if (!remoteNote) {
            // Note only exists on local
            notesToUpsert.push(localNote);
            upsertNew++;
            continue;
          } else if (
            new Date(remoteNote.updated_at) < new Date(localNote.updatedAt)
          ) {
            upsertUpdated++;
            // Local version is newer
            notesToUpsert.push(localNote);
          }
        }

        // Execute sync operations
        if (notesToFetch.length > 0) {
          console.log(
            `fetching ${fetchNew} new notes and ${fetchUpdated} updated notes...`
          );
          const { data, error: fetchError } = await supabase
            .from("notes")
            .select("*");

          if (fetchError) throw new Error(fetchError.message);
          if (!data) {
            console.log("data empty");
            return;
          }

          // Leave only requested notes
          const fetchedNotes = data.filter((n) =>
            notesToFetch.some((ntf) => ntf.id === n.id)
          );

          const updatedNotes: Note[] = [
            ...get().notes.map((n) => {
              const fetchedNote = fetchedNotes.find((fn) => fn.id === n.id);
              return fetchedNote ? { ...fetchedNote.note } : n;
            }),
          ];
          const newNotes = fetchedNotes.filter(
            (n) => !updatedNotes.some((note) => note.id === n.id)
          );

          console.log(fetchedNotes.length);

          await get().setNotes([
            ...updatedNotes,
            ...newNotes.map((n) => n.note),
          ]);
        }

        if (notesToUpsert.length > 0) {
          console.log(
            `upserting ${upsertNew} new notes and ${upsertUpdated} updated...`
          );

          const { error: upsertError } = await supabase.from("notes").upsert(
            notesToUpsert.map((note) => ({
              id: note.id,
              user_id: user?.id,
              email: user.email,
              updated_at: note.updatedAt,
              created_at: note.createdAt,
              note,
            })),
            { onConflict: "id" }
          );

          if (upsertError) throw new Error(upsertError.message);

          console.log(`succesfully upserted ${notesToUpsert.length} notes!!!`);
        }
      } else {
        console.log(`Couldnt get any data from notes. ${data}`);
      }
    } catch (error: any) {
      Alert.alert(
        "Ocurrió un error sincronizando notas con servidor",
        error.message
      );
    } finally {
      set({ loading: false });
    }
  },
}));

const saveNewFilesInCache = async (
  contents: ContentBlock[]
): Promise<ContentBlock[]> => {
  let updatedContents = [...contents];

  for (const cblock of contents) {
    const isFile =
      cblock.type === ContentType.AUDIO || cblock.type === ContentType.IMAGE;
    if (!isFile) continue;
    if (cblock.props.filename) continue;
    // filename is assigned at the end of this operation, as a way to easy know if the file (should) exist in cache

    const bucket =
      cblock.type === ContentType.IMAGE
        ? SUPABASE_BUCKET.IMAGES
        : SUPABASE_BUCKET.AUDIOS;

    // Check if exists in cache
    if (!cblock.props.uri) continue;
    const currentName = `${cblock.props.uri?.split("/").pop()}`; // filename.fileExt
    if (!currentName) continue; // this should never happen since every audio/img file requires a uri

    const cachePath = await checkFileInCache(currentName, bucket);

    if (!cachePath) {
      // Prepare copy to cache
      const filename = `${cblock.id}+${currentName}`;
      const uri = await saveFileToCache(cblock.props.uri, filename, bucket);

      if (uri) {
        // Update block uri and filename props
        updatedContents = updatedContents.map((cb) => {
          return cb.id === cblock.id
            ? {
                ...cb,
                props: { ...cb.props, uri, filename },
              }
            : cb;
        });
      }
    }
  }
  return updatedContents;
};
