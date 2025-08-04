import { Alert } from "react-native";
import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { storeData, getData } from "@/lib/async-storage";
import { supabase } from "@/lib/supabase";
import { SUPABASE_BUCKET } from "@/types";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (value: User | null) => Promise<void>;
  getUser: () => Promise<User | null>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeStore: () => Promise<void>;
}

const STORAGE_KEY = "auth_user";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  setUser: async (user) => {
    set({ user });
    await storeData(STORAGE_KEY, user);
  },
  getUser: async () => {
    const currentUser = get().user;
    if (!currentUser) {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw new Error(error.message);

        // Alert.alert(error.name, error.message);
        // return null;
      }
      await get().setUser(user);
      return user;
    } else {
      return currentUser;
    }
  },

  initializeStore: async () => {
    try {
      const user = await getData(STORAGE_KEY);
      if (user) set({ user });
    } catch (error) {
      console.error("Error initializing auth store:", error);
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      if (data.user) await get().setUser(data.user);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw new Error(error.message);
      if (data.user) {
        await get().setUser(data.user);

        // ensure user folders exists
        // images
        const { data: imgFolder, error: ensureImgFolderErr } =
          await supabase.storage
            .from(SUPABASE_BUCKET.IMAGES)
            .list(`${data.user.id}/`);
        if (ensureImgFolderErr || imgFolder.length === 0) {
          const { error: uploadErr } = await supabase.storage
            .from(SUPABASE_BUCKET.IMAGES)
            .upload(`${data.user.id}/.placeholder`, "");
          if (uploadErr)
            throw new Error(`${uploadErr.name}. ${uploadErr.message}`);
        }
        // audios
        const { data: audFolder, error: ensureAudFolderErr } =
          await supabase.storage
            .from(SUPABASE_BUCKET.AUDIOS)
            .list(`${data.user.id}/`);
        if (ensureAudFolderErr || audFolder.length === 0) {
          const { error: uploadErr } = await supabase.storage
            .from(SUPABASE_BUCKET.AUDIOS)
            .upload(`${data.user.id}/.placeholder`, "");
          if (uploadErr)
            throw new Error(`${uploadErr.name}. ${uploadErr.message}`);
        }
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signOut();
      await get().setUser(null);
      if (error) throw new Error(error.name + ". " + error.message);
    } catch (error: any) {
      Alert.alert("Error cerrando sesión", error.message);
    } finally {
      set({ isLoading: false });
    }
  },
}));

// const userPlaceholder = {
//   id: "123",
//   app_metadata: {
//     test: true,
//   },
//   user_metadata: {
//     test: true,
//   },
//   aud: "string",
//   email: "raidellg9511@gmail.com",
//   created_at: "string",
//   updated_at: "string",
// };
