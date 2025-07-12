/* eslint-disable prettier/prettier */

import { create } from "zustand";

import { Note } from "@/types";
import { getData, storeData } from "@/lib/async-storage";

interface NotesState {
  notes: Note[];
  loading: boolean;
  setNotes: (notes: Note[]) => Promise<void>;
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (id: string, note: Partial<Note>, setUpdatedAt?: boolean) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
  getAllTags: () => string[];
  initializeNotes: () => Promise<void>;
}

export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  loading: false,
  setNotes: async (notes) => {
    set({ notes });
    await storeData("notes", notes);
  },
  addNote: (note) => {
    // console.log("add note");
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    };
    get().setNotes([...get().notes, newNote]);
  },
  updateNote: (id, note, setUpdatedAt = true) => {
    // console.log("update note");
    get().setNotes([
      ...get().notes.map((n) =>
        n.id === id
          ? {
              ...n,
              ...note,
              updatedAt: setUpdatedAt ? new Date().toISOString() : n.updatedAt,
            }
          : n
      ),
    ]);
  },
  deleteNote: (id) => {
    get().setNotes(get().notes.filter((n) => n.id !== id));
  },
  getNote: (id) => get().notes.find((n) => n.id === id),
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
    set({ loading: true });

    try {
      const notes = await getData("notes");
      if (notes) {
        set({ notes });
      }
    } catch (error) {
      console.log(error);
    } finally {
      set({ loading: false });
    }
  },
}));
