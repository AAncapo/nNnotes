import { Alert } from "react-native";
import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { storeData, getData } from "@/lib/async-storage";
import { supabase } from "@/lib/supabase";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
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
  getUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      Alert.alert(error.name, error.message);
      return null;
    }
    return user;
  },

  initializeStore: async () => {
    try {
      const storedUser = await getData(STORAGE_KEY);
      if (storedUser) {
        set({ user: storedUser.user });
      }
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
      if (data.user) {
        const user = data.user;
        set({ user });
        await storeData(STORAGE_KEY, { user: user });
      }
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
        const user = data.user;
        set({ user });
        await storeData(STORAGE_KEY, { user: user });
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
      set({ user: null });
      await storeData(STORAGE_KEY, { user: null });
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
