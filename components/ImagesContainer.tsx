import { Alert, Modal, View } from "react-native";
import { ImageBlock } from "./content-blocks/ImageBlock";
import { ContentBlock } from "@/types";
import { useState } from "react";
import ImageViewer from "./ImageViewer";

interface ImagesContainerProps {
  images: ContentBlock[];
  maxPerRow: 3 | 4;
  // onEditProp: (id: string, name: string) => void;
  onUpdate: (contentBlock: ContentBlock) => void;

  onDelete: (id: string) => void;
}

function ImagesContainer({
  images,
  maxPerRow,
  // onEditProp,
  onUpdate,
  onDelete,
}: ImagesContainerProps) {
  // const colorScheme = useTheme(useColorScheme());
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openFullscreen = (index: number) => {
    setSelectedIndex(index);
    setFullscreenVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete image", "Do you want to delete this image?", [
      { text: "CANCEL" },
      { text: "CONFIRM", onPress: () => onDelete(id) },
    ]);
  };

  const renderImage = (img: ContentBlock, index: number) => {
    const isOverflow = index === maxPerRow - 1 && images.length > maxPerRow;
    // console.log("image. " + img.props.uploadedAt);
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
          // editProp={onEditProp}
          onUpdate={onUpdate}
          onDelete={handleDelete}
          onClose={() => setFullscreenVisible(false)}
        />
      </Modal>
    </>
  );
}

export default ImagesContainer;
