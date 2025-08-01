import * as FileSystem from "expo-file-system";
import { supabase } from "./supabase";
import { useAuthStore } from "@/store/useAuthStore";

// filename: userId + blockId + filename

export enum SUPABASE_BUCKET {
  IMAGES = "images",
  AUDIOS = "audios",
}

// Takes a file saved in cache and try to upload to supabase storage
export const uploadFile = async (filename: string, bucket: SUPABASE_BUCKET) => {
  const cachePath = getCachePath(filename, bucket);
  const supabaseFilePath = getSupabasePath(filename, bucket);

  try {
    const exists = await checkFileInCache(filename, bucket);
    if (!exists)
      throw new Error(`File ${filename.split("+").pop()} not found in cache`);

    // Read the file as base64
    const base64Data = await FileSystem.readAsStringAsync(cachePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Determine content type based on file extension
    const extension = filename.split(".").pop()?.toLowerCase();
    let contentType =
      bucket === SUPABASE_BUCKET.IMAGES ? `image/${extension}}` : "audio/mpeg"; // default to mp3

    if (extension === "wav") contentType = "audio/wav";
    if (extension === "ogg") contentType = "audio/ogg";
    if (extension === "aac") contentType = "audio/aac";
    if (extension === "m4a") contentType = "audio/mp4";

    // Decode base64
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decodedBase64 = bytes;

    // Upload
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(supabaseFilePath, decodedBase64, {
        contentType,
        upsert: true,
      });

    if (uploadError)
      throw new Error(
        `Error subiendo imagen al servidor. ${uploadError.name}. ${uploadError.message}`
      );
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Seach for a file in cache and in supabase storage bucket
export const getFile = async (
  filename: string,
  bucket: SUPABASE_BUCKET
): Promise<string | null> => {
  try {
    const cacheDir = getCachePath(filename, bucket);

    // Check if image is already in cache
    const isCached = await checkFileInCache(filename, bucket);
    if (isCached) return cacheDir;

    // If not in cache, try to download from Supabase
    const filePath = getSupabasePath(filename, bucket);
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (error) throw new Error(error.message);

    const reader = new FileReader();
    reader.readAsDataURL(data);

    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const base64Data = base64.split(",")[1] as string;
          await FileSystem.writeAsStringAsync(cacheDir, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          resolve(cacheDir);
        } catch (error) {
          console.error("Error saving file:", error);
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(error);
      };
    });
  } catch (error) {
    console.error("Error downloading and caching file:", error);
    return null;
  }
};

export const checkFileInCache = async (
  filename: string,
  bucket: SUPABASE_BUCKET
): Promise<boolean> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(
      getCachePath(filename, bucket)
    );
    return fileInfo.exists;
  } catch (error) {
    console.error("Error checking cache:", error);
    return false;
  }
};

export const saveFileToCache = async (
  uri: string, // origen
  filename: string, // nombre que tendrá el archivo en el sistema
  bucket: SUPABASE_BUCKET
): Promise<string | null> => {
  try {
    let path: string = getCachePath(filename, bucket);
    await FileSystem.copyAsync({
      from: uri,
      to: path,
    });
    console.log("File saved to: ", path);
    return path;
  } catch (error) {
    console.error("Error saving to cache:", error);
    return null;
  }
};

export const getCachePath = (filename: string, bucket: SUPABASE_BUCKET) =>
  `${FileSystem.cacheDirectory}${bucket}/${filename}`;

const getSupabasePath = (filename: string, bucket: SUPABASE_BUCKET) => {
  const userId = useAuthStore.getState().user?.id;
  if (!userId)
    throw new Error("Error at getSupabaseFilepath. User must be logged in");

  return `${bucket}/${userId}/${filename}`;
};

// export const removeFromCache = async (
//   fileName: string,
//   bucket: SUPABASE_BUCKET
// ) => {
//   try {
//     await FileSystem.deleteAsync(getCachePath(fileName, bucket));
//   } catch (error) {
//     console.error("Error deleting from cache:", error);
//   }
// };

// export const removeFromServer = async (
//   filePath: string,
//   bucket: SUPABASE_BUCKET
// ) => {
//   const { error: deleteError } = await supabase.storage
//     .from(bucket)
//     .remove([filePath]);

//   if (deleteError) {
//     console.error("Error deleting from Supabase:", deleteError);
//     Alert.alert("Error", "No se pudo eliminar la foto de Supabase");
//     return;
//   }
// };
