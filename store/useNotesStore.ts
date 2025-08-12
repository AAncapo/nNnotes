import { create } from "zustand";
import { Alert } from "react-native";
import { router } from "expo-router";

import {
  ContentBlock,
  ContentType,
  DELETED_FOLDER_ID,
  Note,
  NotesFolder,
  NoteTag,
  PROTECTED_FOLDER_ID,
  SUPABASE_BUCKET,
} from "@/types";
import { useAuthStore } from "./useAuthStore";
import {
  checkFileInCache,
  saveFileToCache,
  uploadFile,
} from "@/lib/supabase-storage";
import { supabase } from "@/lib/supabase";
import { getData, storeData } from "@/lib/async-storage";
import { getDateISOString } from "@/lib/utils";

const STORAGE_KEY = "notes";

interface NotesState {
  notes: Note[];
  folders: NotesFolder[];
  tags: NoteTag[];
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
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string) => Note | undefined;
  initializeNotes: () => Promise<void>;
  syncNotes: () => Promise<void>;
  setFolders: (folders: NotesFolder[]) => Promise<void>;
  setTags: (tags: NoteTag[]) => Promise<void>;
}

const DEFAULT_FOLDERS = [
  { id: DELETED_FOLDER_ID, name: "Trash" },
  { id: PROTECTED_FOLDER_ID, name: "Protected" },
] as NotesFolder[];

export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  folders: [...DEFAULT_FOLDERS],
  tags: [{ name: "tag1" }, { name: "tag2prueba" }],
  selectedFolder: null,
  loading: false,

  setNotes: async (notes) => {
    set({ notes });
    await storeData(STORAGE_KEY, { ...get(), notes });
  },

  addNote: async (note) => {
    const updatedContent = await saveNewFilesInCache(note.content);

    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      content: [...updatedContent],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await get().setNotes([...get().notes, newNote]);
  },

  updateNote: async (id, note, setUpdatedAt = true) => {
    let updatedContent = [] as ContentBlock[];
    if (note.content) {
      updatedContent = await saveNewFilesInCache(note.content);
    }
    await get().setNotes([
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

  deleteNote: async (id) => {
    get().setNotes(get().notes.filter((n) => n.id !== id));
  },

  getNote: (id) => get().notes.find((n) => n.id === id),

  initializeNotes: async () => {
    try {
      set({ loading: true });
      const data = await getData("notes");
      if (data) {
        // Check notes deleted more than 7 days ago
        const expiredNotesId: string[] = (
          data.notes.filter((n: Note) => {
            if (n.folder === DELETED_FOLDER_ID) {
              const msDiff =
                new Date().getTime() - new Date(n.updatedAt).getTime();
              const msPerDay = 1000 * 60 * 60 * 24;
              const diffInDays = msDiff / msPerDay;

              return diffInDays >= 7; // return notes 7 days older
            }
          }) as Note[]
        ).map((n) => n.id);

        const noteCount = data.notes.length;
        console.log(`${expiredNotesId.length} expired notes`);

        // Remove expiredNotes from data.notes
        const notes = (data.notes as Note[]).filter(
          (n) => !expiredNotesId.some((id) => n.id === id)
        );

        console.log(`Removed ${noteCount - notes.length} expired notes`);

        set({
          ...get(),
          loading: false,
          notes,
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

      console.log("checking authentication...");
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

      console.log("reading notes table...");
      const { data, error } = await supabase
        .from("notes")
        .select("id, updated_at");

      if (error) throw new Error(error.message);

      if (!data) {
        console.log(`Couldn't get any data from notes. ${data}`);
        return;
      }

      let notesToFetch = [];
      let notesToUpsert: Note[] = [];

      // Avoid syncing deleted notes
      const localNotes = get().notes.filter((n) => n.folder !== "deleted");
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
      // Fetching...
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

        await get().setNotes([...updatedNotes, ...newNotes.map((n) => n.note)]);
      }

      // Upserting...
      if (notesToUpsert.length > 0) {
        console.log("upserting...");
        let updatedNotes = [] as Note[];
        // Update storage buckets
        for (const note of notesToUpsert) {
          const files = note.content.filter(
            (c) => c.type === ContentType.IMAGE || c.type === ContentType.AUDIO
          );

          for (const f of files) {
            const bucket =
              f.type === ContentType.IMAGE
                ? SUPABASE_BUCKET.IMAGES
                : SUPABASE_BUCKET.AUDIOS;

            if (!f.props.filename) continue;

            // skip image if was already uploaded
            if (!f.props.uploadedAt) {
              console.log(`Uploading ${bucket} file...`);
              await uploadFile(f.props.filename, bucket);
              // push to updatedNotes
              updatedNotes.push({
                ...note,
                content: [
                  ...note.content.map((c) => {
                    return c.id === f.id
                      ? {
                          ...f,
                          props: {
                            ...f.props,
                            uploadedAt: getDateISOString(),
                          },
                        }
                      : c;
                  }),
                ],
              });
            }
          }
        }

        // update local state uploadedAt value
        await get().setNotes([
          ...get().notes.map((n) => {
            const updatedNote = updatedNotes.find((un) => un.id === n.id);
            return !updatedNote ? n : updatedNote;
          }),
        ]);

        // update array to save in server with uploadedAt value
        notesToUpsert = notesToUpsert.map((n) => {
          const updatedNote = updatedNotes.find((un) => un.id === n.id);
          return !updatedNote ? n : updatedNote;
        });

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
    } catch (error: any) {
      Alert.alert(
        "Ocurrió un error sincronizando notas con servidor",
        error.message
      );
    } finally {
      set({ loading: false });
    }
  },
  setFolders: async (folders) => {
    set({ folders });
    await storeData(STORAGE_KEY, { ...get(), folders });
  },
  setTags: async (tags) => {},
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
    const currentName = `${cblock.props.uri!.split("/").pop()}`; // filename.fileExt

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
