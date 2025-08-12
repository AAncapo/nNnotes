import { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

import { ContentBlock } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ImageViewerProps {
  images: ContentBlock[];
  initialIndex: number;
  onUpdate: (contentBlock: ContentBlock) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function ImageViewer({
  images,
  initialIndex,
  onUpdate,
  onDelete,
  onClose,
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showText, setShowText] = useState(true);

  // Handle hardware back button pressed
  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener(
  //     "hardwareBackPress",
  //     () => {
  //       onClose();
  //       return true; // Prevent default behavior
  //     }
  //   );

  //   return () => backHandler.remove();
  // }, [onClose]);

  const goNext = () => {
    const index = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(index);
  };

  const goPrev = () => {
    const index = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setCurrentIndex(index);
  };

  const handleTextVisibility = () => {
    if (images[currentIndex].props.text) {
      setShowText(!showText);
    }
  };

  const handleDelete = () => {
    if (currentIndex === images.length - 1) {
      // the deleted image is the currentIndex
      if (images.length > 1) {
        setCurrentIndex(currentIndex - 1);
      }
    }
    onDelete(images[currentIndex].id);
  };

  return (
    <Modal
      transparent={true}
      visible={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)" }}
      >
        <View
          className="flex-row w-full items-center p-4 px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
        >
          <View className="flex-1 flex-row items-start space-x-4">
            <TouchableOpacity className="p-4" onPress={handleDelete}>
              <MaterialIcons name="delete" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-white font-bold text-md">
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
          <View className="flex-1">
            <TouchableOpacity className="self-end p-4" onPress={onClose}>
              <AntDesign name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.imageContainer}>
          <TouchableOpacity
            className="w-full h-full"
            activeOpacity={1}
            onPress={handleTextVisibility}
          >
            <Image
              source={{ uri: images[currentIndex].props.uri }}
              className="w-full h-full"
              resizeMode="contain"
            />
          </TouchableOpacity>
          {showText && (
            <View
              className="absolute w-full h-fit p-4"
              style={{ bottom: 0, backgroundColor: "rgba(0,0,0,0.9)" }}
            >
              <TextInput
                className="text-white text-center w-full h-fit"
                multiline
                editable
                value={images[currentIndex].props.text}
                onChangeText={(text) =>
                  onUpdate({
                    ...images[currentIndex],
                    props: { ...images[currentIndex].props, text },
                  })
                }
              />
            </View>
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            onPress={goPrev}
            disabled={images.length === 1}
            className="p-10"
          >
            <AntDesign name="left" size={28} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goNext}
            disabled={images.length === 1}
            className="p-10"
          >
            <AntDesign name="right" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  counterText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  navigationContainer: {
    backgroundColor: "rgba(0,0,0,0.9)",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 4,
  },
});
