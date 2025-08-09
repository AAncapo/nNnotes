import { checkFileInCache, getFile } from "@/lib/supabase-storage";
import { Octicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { ContentBlock, SUPABASE_BUCKET } from "types";

interface ImageBlockProps {
  index: number;
  block: ContentBlock;
  isOverflow: boolean;
  wrappedNum?: number;
  maxPerRow: 3 | 4;
  onSelected: (index: number) => void;
}

enum ImageStatus {
  NULL = "null",
  NOT_LOADED = "!loaded",
  LOADED = "loaded",
}

export function ImageBlock({
  index,
  block,
  isOverflow,
  wrappedNum,
  maxPerRow,
  onSelected,
}: ImageBlockProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uri, setUri] = useState<string | null>(block.props.uri || null);

  // useEffect(() => {
  //   if (!block.props.filename) return;

  //   checkFileInCache(block.props.filename, SUPABASE_BUCKET.IMAGES).then(
  //     (res) => {
  //       if (res) setUri(res ? block.props.uri || "" : null);
  //     }
  //   );
  // }, []);

  const onDownload = async () => {
    try {
      setIsLoading(true);
      if (!block.props.filename)
        throw new Error(
          "Image doesn't have a filename assigned. It cannot be downloaded"
        );

      const cachePath = await getFile(
        block.props.filename,
        SUPABASE_BUCKET.IMAGES
      );
      if (cachePath) {
        setUri(cachePath);
      }
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.imageContainer,
        { width: maxPerRow === 3 ? "33%" : "25%" },
      ]}
    >
      <View className="w-full h-full rounded-md overflow-hidden bg-gray-400">
        {uri ? (
          <TouchableOpacity
            style={styles.wrapperTouchable}
            onPress={() => onSelected(index)}
          >
            <Image
              source={{ uri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <View className="w-full h-full items-center justify-center">
            {isLoading ? (
              <ActivityIndicator size={24} color="white" />
            ) : (
              <TouchableOpacity
                style={styles.wrapperTouchable}
                onPress={onDownload}
              >
                <Octicons name="download" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
        )}
        {isOverflow && (
          <View style={styles.overflowOverlay}>
            <Text style={styles.overflowText}>+ {wrappedNum?.toString()}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    // width: "33%", // Para 3 imágenes por fila (usar 25% para 4)
    aspectRatio: 1,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  wrapperTouchable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  overflowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  overflowText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
