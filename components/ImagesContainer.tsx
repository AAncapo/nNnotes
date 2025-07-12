/* eslint-disable prettier/prettier */
import { Modal, TouchableOpacity, useColorScheme, View } from "react-native";
import { ImageBlock } from "./content-blocks/ImageBlock";
import { ContentBlock } from "@/types";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import useTheme from "@/lib/themes";
import { ImageViewer } from "./ImageViewer";

interface ImagesContainerProps {
  images: ContentBlock[];
  maxPerRow: 3 | 4;
  // openOptions: (id: string) => void;
  onDelete: (id: string) => void;
}

function ImagesContainer({
  images,
  maxPerRow,
  // openOptions,
  onDelete,
}: ImagesContainerProps) {
  // const colorScheme = useTheme(useColorScheme());
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openFullscreen = (index: number) => {
    setSelectedIndex(index);
    setFullscreenVisible(true);
  };

  const renderImage = (img: ContentBlock, index: number) => {
    // const isLastInRow = index === maxPerRow - 1;
    const isOverflow = index === maxPerRow - 1 && images.length > maxPerRow;

    return (
      <ImageBlock
        key={img.id}
        index={index}
        block={img}
        isOverflow={isOverflow}
        maxPerRow={maxPerRow}
        wrappedNum={images.length - maxPerRow}
        onSelected={openFullscreen}
      />
    );
  };
  return (
    <>
      <View className="flex-row flex-wrap my-4">
        {images.slice(0, maxPerRow).map(renderImage)}
      </View>
      <Modal visible={fullscreenVisible} transparent={true}>
        <ImageViewer
          images={images}
          initialIndex={selectedIndex}
          onDelete={(index) => onDelete(images[index].id)}
          onClose={() => setFullscreenVisible(false)}
        />
      </Modal>
    </>
  );
}

export default ImagesContainer;
