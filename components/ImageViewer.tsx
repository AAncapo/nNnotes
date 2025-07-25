import { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Text,
  SafeAreaView,
  useColorScheme,
  TextInput,
} from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

import { BlockProps, ContentBlock } from "@/types";
import useTheme from "@/lib/themes";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ImageViewerProps {
  images: ContentBlock[];
  initialIndex: number;
  // editProp: (id: string, name: string) => void;
  onUpdate: (contentBlock: ContentBlock) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function ImageViewer({
  images,
  initialIndex,
  onUpdate,
  // editProp,
  onDelete,
  onClose,
}: ImageViewerProps) {
  const colorScheme = useTheme(useColorScheme());
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
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)" }}>
        <View
          className="flex-row w-full items-center p-4 px-8"
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
        >
          <View className="flex-1 flex-row items-start space-x-4">
            <TouchableOpacity className="p-4" onPress={handleDelete}>
              <MaterialIcons
                name="delete"
                size={24}
                color={colorScheme?.icons}
              />
            </TouchableOpacity>
          </View>
          <View className="flex-1 items-center">
            <Text style={[styles.counterText, { color: colorScheme?.text }]}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
          <View className="flex-1">
            <TouchableOpacity className="self-end p-4" onPress={onClose}>
              <AntDesign name="close" size={24} color={colorScheme?.text} />
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
            style={styles.navButton}
          >
            <AntDesign name="left" size={28} color={colorScheme?.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goNext}
            disabled={images.length === 1}
            style={styles.navButton}
          >
            <AntDesign name="right" size={28} color={colorScheme?.text} />
          </TouchableOpacity>
        </View>
      </View>
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
    fontSize: 16,
    fontWeight: "bold",
  },
  navigationContainer: {
    backgroundColor: "rgba(0,0,0,0.9)",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  navButton: {
    padding: 20,
  },
});
