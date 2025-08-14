import { create } from "zustand";
import { Alert } from "react-native";

import {
  DELETED_FOLDER_ID,
  Note,
  NotesFolder,
  NoteTag,
  PROTECTED_FOLDER_ID,
} from "@/types";
import { getData, storeData } from "@/lib/async-storage";
import { getDateISOString, getRandomID, handleSyncNotes } from "@/lib/utils";

const STORAGE_KEY = "notes";

interface NotesState {
  notes: Note[];
  folders: NotesFolder[];
  tags: NoteTag[];
  selectedFolder: string | null;
  loading: boolean;
  setNotes: (notes: Note[]) => Promise<void>;
  addNote: (note: Note) => Promise<void>;
  updateNote: (
    id: string,
    note: Partial<Note>,
    setUpdatedAt?: boolean
  ) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  recoverNote: (id: string) => Promise<void>;
  destroyNote: (id: string) => Promise<void>;
  getNote: (id: string) => Note | undefined;
  initializeNotes: () => Promise<void>;
  syncNotes: () => Promise<void>;
  setFolders: (folders: NotesFolder[]) => Promise<void>;
  // setTags: (tags: NoteTag[]) => Promise<void>;
  selectFolder: (selectedFolder?: string) => void;
  getNoteByFolder: (folderId?: string) => Note[];
  addFolder: (name: string) => Promise<void>;
  // updateFolder: (id: string, propName: string, value: any) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  moveToFolder: (noteId: string, folder: string | undefined) => Promise<void>;
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
    await get().setNotes([...get().notes, note]);
  },

  updateNote: async (id, note, setUpdatedAt = true) => {
    await get().setNotes([
      ...get().notes.map((n) =>
        n.id === id
          ? {
              ...n,
              ...note,
              updatedAt: setUpdatedAt ? getDateISOString() : n.updatedAt,
            }
          : n
      ),
    ]);
  },

  deleteNote: async (id) => {
    await get().setNotes([
      ...get().notes.map((n) => {
        return n.id === id
          ? {
              ...n,
              updatedAt: getDateISOString(),
              isDeleted: true,
            }
          : n;
      }),
    ]);
  },

  recoverNote: async (id) => {
    await get().setNotes([
      ...get().notes.map((n) => {
        return n.id === id
          ? {
              ...n,
              updatedAt: getDateISOString(),
              isDeleted: false,
            }
          : n;
      }),
    ]);
  },

  destroyNote: async (id) => {
    await get().setNotes(get().notes.filter((n) => n.id !== id));
  },

  getNote: (id) => get().notes.find((n) => n.id === id),

  initializeNotes: async () => {
    try {
      set({ loading: true });
      const data = await getData(STORAGE_KEY);
      if (data) {
        // Check notes deleted more than 7 days ago
        const expiredNotesId: string[] = (
          data.notes.filter((n: Note) => {
            if (n.isDeleted) {
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

      const updatedNotes = await handleSyncNotes(get().notes);
      if (!updatedNotes) return;

      await get().setNotes([...updatedNotes]);
    } catch (error: any) {
      Alert.alert("Error syncing notes", error.message);
    } finally {
      set({ loading: false });
    }
  },

  setFolders: async (folders) => {
    set({ folders });
    await storeData(STORAGE_KEY, { ...get(), folders });
  },

  // Folder & tags handling ...
  selectFolder: (selectedFolder?: string) => set({ selectedFolder }),

  getNoteByFolder: (folderId?: string) => {
    // by default returns all except deleted, protected and notes without folder defined or existent
    return get().notes.filter(
      (n) =>
        folderId
          ? folderId === DELETED_FOLDER_ID
            ? n.isDeleted // show deleted only
            : n.folder === folderId // show from specified folder
          : (!n.isDeleted && n.folder !== PROTECTED_FOLDER_ID) ||
            (!n.isDeleted && !n.folder) // undefined folderId shows all notes except deleted or protected
    );
  },

  addFolder: async (name: string) => {
    const updatedFolders = [...get().folders, { id: getRandomID(), name }];
    get().setFolders(updatedFolders);
  },

  // updateFolder: async (id: string, propName: string, value: any) => {},

  deleteFolder: async (id: string) => {
    if (id === DELETED_FOLDER_ID || id === PROTECTED_FOLDER_ID) return;

    const updatedFolders = [...get().folders.filter((f) => f.id !== id)];
    get().setNotes([
      ...get().notes.map((n) => ({
        ...n,
        folder: n.folder === id ? undefined : n.folder,
      })),
    ]);

    get().setFolders(updatedFolders);
  },

  moveToFolder: async (noteId: string, folder: string | undefined) => {
    // undefined is meant for notes without folder
    await get().setNotes([
      ...get().notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              folder,
            }
          : n
      ),
    ]);
  },

  // setTags: async (tags) => {},
}));
