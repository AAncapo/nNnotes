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
  return (
    <View
      style={[
        styles.imageContainer,
        { width: maxPerRow === 3 ? "33%" : "25%" },
      ]}
    >
      <TouchableOpacity onPress={() => onSelected(index)}>
        <Image
          source={{ uri: block.props.uri }}
          style={styles.image}
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
  image: { width: "100%", height: "100%", borderRadius: 4 },
  overflowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  overflowText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
