import { Alert, ColorSchemeName, Platform } from "react-native";
import { router } from "expo-router";
import { ContentBlock, ContentType, Note, SUPABASE_BUCKET } from "@/types";
import { supabase } from "./supabase";
import { checkFileInCache, downloadFile, uploadFile } from "./supabase-storage";
import { useAuthStore } from "@/store/useAuthStore";

export const isPlatformWeb = Platform.OS === "web";

export const getIconColor = (
  colorScheme: ColorSchemeName,
  disabled?: boolean
) => (disabled ? "#eee" : colorScheme === "dark" ? "white" : "#1f2937");

export const getNewNoteID = () => `${Date.now().toString()}_${getRandomID()}`;

export const getRandomID = () =>
  `${Date.now() + Math.abs(Math.random() * 1000)}`;

export const getDateISOString = () => new Date().toISOString();

export function convertAndFormatUTC(utcDateTime: string, options = {}) {
  try {
    const date = new Date(utcDateTime);
    if (isNaN(date.getTime())) return null;

    // Default formatting options
    const defaultOptions = {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Merge user options with defaults
    const formatOptions = {
      ...defaultOptions,
      ...options,
    } as Intl.DateTimeFormatOptions;

    return new Intl.DateTimeFormat(navigator.language, formatOptions).format(
      date
    );
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export const handleSyncNotes = async (
  updatedNotes: Note[]
): Promise<Note[] | undefined | null> => {
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
    return null;
  }

  console.log("reading notes table...");
  const { data, error } = await supabase
    .from("notes")
    .select("id, is_deleted, updated_at");

  if (error) throw new Error(error.message);

  if (!data) {
    console.log(`Couldn't get any data from notes. ${data}`);
    return null;
  }

  let notesToFetch = [];
  let notesToUpsert: Note[] = [];

  // Check files that need to be fetched/upserted
  let filesToFetch: {
    filename: string;
    bucket: SUPABASE_BUCKET;
  }[] = [];
  let filesToUpsert: {
    filename: string;
    bucket: SUPABASE_BUCKET;
  }[] = [];

  const localNotes = updatedNotes;
  const remoteNotes = data;

  // log values
  let fetchUpdated = 0;
  let fetchNew = 0;
  let upsertNew = 0;
  let upsertUpdated = 0;

  // Check remote notes that need to be fetched
  for (const remoteNote of remoteNotes) {
    const localNote = localNotes.find((n) => n.id === remoteNote.id);

    if (remoteNote.is_deleted) continue; // Ignore deleted notes completely

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

  // Check local notes that need to be upserted
  for (const localNote of localNotes) {
    const remoteNote = remoteNotes.find((n) => n.id === localNote.id);

    if (!remoteNote) {
      // Note only exists on local
      if (localNote.isDeleted) continue; // Ignore if has been deleted already

      notesToUpsert.push(localNote);
      upsertNew++;
      continue;
    } else if (
      new Date(remoteNote.updated_at) < new Date(localNote.updatedAt)
    ) {
      // Local version is newer
      if (localNote.isDeleted && remoteNote.is_deleted) {
        continue; // Ignorar si local isDeleted y ya se actualizó is_deleted en remota
      }

      upsertUpdated++;
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
      return null;
    }

    // Leave only requested notes
    const fetchedNotes = data.filter((n) =>
      notesToFetch.some((ntf) => ntf.id === n.id)
    );

    updatedNotes = [
      ...updatedNotes.map((n) => {
        const fetchedNote = fetchedNotes.find((fn) => fn.id === n.id);
        return fetchedNote ? { ...fetchedNote.note } : n;
      }),
    ];

    const newNotes = fetchedNotes.filter(
      (n) => !updatedNotes.some((note) => note.id === n.id)
    );

    updatedNotes = [...updatedNotes, ...newNotes.map((n) => n.note)];
  }

  // Check all files that need to be fetched
  console.log("searching files that need to be fetched...");
  let allFiles: ContentBlock[] = updatedNotes
    .filter((n) => !n.isDeleted)
    .flatMap((n) => {
      return n.content.filter(
        (c) => c.type === ContentType.IMAGE || c.type === ContentType.AUDIO
      );
    });

  // Check files in cache...
  for (const f of allFiles) {
    const bucket =
      f.type === ContentType.IMAGE
        ? SUPABASE_BUCKET.IMAGES
        : SUPABASE_BUCKET.AUDIOS;
    const ok = await checkFileInCache(f.props.filename || "", bucket);
    if (!ok) filesToFetch.push({ filename: f.props.filename || "", bucket });
  }
  console.log(`found ${filesToFetch.length} files that need to be fetched`);

  // Upserting...
  if (notesToUpsert.length > 0) {
    console.log("upserting...");

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

        // skip file if was already uploaded
        if (!f.props.uploadedAt) {
          filesToUpsert.push({ filename: f.props.filename, bucket });
          const updatedNote: Note = {
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
          };

          // save in updatedNotes with uploadedAt value defined
          updatedNotes = updatedNotes.map((n) => {
            return n.id === note.id ? updatedNote : n;
          });

          // update array to save in server with uploadedAt value
          notesToUpsert = notesToUpsert.map((n) => {
            return n.id === note.id ? updatedNote : n;
          });
        }
      }
    }

    // Upserting files...
    // TODO: hay que definir q files no se pudieron subir para no asignar uploadedAt despues de upsert files y antes de upsert notes
    console.log(`upserting ${filesToUpsert.length} files...`);
    Promise.allSettled(
      filesToUpsert.map((ftu) => {
        return uploadFile(ftu.filename, ftu.bucket);
      })
    ).then((results) => {
      const success = results.filter((r) => r.status === "fulfilled");
      console.log(
        `---- upserted ${success.length} files with ${results.length - success.length} errors`
      );
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
        is_deleted: note.isDeleted,
        note,
      })),
      { onConflict: "id" }
    );

    if (upsertError) throw new Error(upsertError.message);

    console.log(`---- succesfully upserted ${notesToUpsert.length} notes!!!`);
  }

  // Fetch files...
  if (filesToFetch.length > 0) {
    console.log(`fetching ${filesToFetch.length} files...`);
    await Promise.allSettled(
      filesToFetch.map((ftf) => {
        return downloadFile(ftf.filename, ftf.bucket);
      })
    ).then((results) => {
      const success = results.filter((r) => r.status === "fulfilled");
      console.log(
        `---- fetched ${success.length} files with ${results.length - success.length} errors`
      );
    });
  }
};
