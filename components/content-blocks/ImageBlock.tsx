import { useMemo } from "react";
import { View, Image, TouchableOpacity, StyleSheet, Text } from "react-native";
import { ContentBlock } from "types";

interface ImageBlockProps {
  index: number;
  block: ContentBlock;
  isOverflow: boolean;
  wrappedNum?: number;
  maxPerRow: 3 | 4;
  onSelected: (index: number) => void;
}

export function ImageBlock({
  index,
  block,
  isOverflow,
  wrappedNum,
  maxPerRow,
  onSelected,
}: ImageBlockProps) {
  const uri = useMemo(() => {
    if (block.props.uri) return block.props.uri;
  }, [block]);

  return (
    <View
      style={[
        styles.imageContainer,
        { width: maxPerRow === 3 ? "33%" : "25%" },
      ]}
    >
      <TouchableOpacity
        onPress={() => onSelected(index)}
        className="w-full h-full"
      >
        <Image
          source={{ uri }}
          className="w-full h-full rounded-sm"
          resizeMode="cover"
        />
        {isOverflow && (
          <View style={styles.overflowOverlay}>
            <Text style={styles.overflowText}>+ {wrappedNum?.toString()}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    // width: "33%", // Para 3 imágenes por fila (usar 25% para 4)
    aspectRatio: 1,
    padding: 2,
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
