import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
  Text,
  SafeAreaView,
  useColorScheme,
  BackHandler,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { ContentBlock } from "@/types";
import useTheme from "@/lib/themes";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ImageViewerProps {
  images: ContentBlock[];
  initialIndex: number;
  onDelete: (index: number) => void;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  images,
  initialIndex,
  onDelete,
  onClose,
}) => {
  const colorScheme = useTheme(useColorScheme());
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [isZoomed, setIsZoomed] = useState(false);

  //   // Handle hardware back button on Android
  //   useEffect(() => {
  //     const backHandler = BackHandler.addEventListener(
  //       "hardwareBackPress",
  //       () => {
  //         onClose();
  //         return true; // Prevent default behavior
  //       }
  //     );

  //     return () => backHandler.remove();
  //   }, [onClose]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === 4) {
      const { translationX } = event.nativeEvent;
      let newIndex = currentIndex;

      if (translationX < -100 && currentIndex < images.length - 1) {
        newIndex = currentIndex + 1;
      } else if (translationX > 100 && currentIndex > 0) {
        newIndex = currentIndex - 1;
      }

      setCurrentIndex(newIndex);
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleZoom = () => {
    Animated.spring(scale, {
      toValue: isZoomed ? 1 : 2,
      useNativeDriver: true,
    }).start();
    setIsZoomed(!isZoomed);
  };

  const goNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={[styles.container, { backgroundColor: "black" }]}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(currentIndex)}
          >
            <MaterialIcons name="delete" size={24} color={colorScheme?.icons} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <AntDesign name="close" size={24} color={colorScheme?.text} />
          </TouchableOpacity>

          <View style={styles.imageCounter}>
            <Text style={[styles.counterText, { color: colorScheme?.text }]}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>

          <View style={styles.imageContainer}>
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
            >
              <Animated.View
                style={[
                  styles.animatedContainer,
                  { transform: [{ translateX }, { scale }] },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={handleZoom}
                  style={styles.imageTouchable}
                >
                  <Image
                    source={{ uri: images[currentIndex].props.uri }}
                    style={styles.fullImage}
                    resizeMode={isZoomed ? "contain" : "cover"}
                  />
                </TouchableOpacity>
              </Animated.View>
            </PanGestureHandler>
          </View>

          <View style={styles.navigationContainer}>
            <TouchableOpacity
              onPress={goPrev}
              disabled={currentIndex === 0}
              style={styles.navButton}
            >
              <AntDesign name="left" size={28} color={colorScheme?.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goNext}
              disabled={currentIndex === images.length - 1}
              style={styles.navButton}
            >
              <AntDesign name="right" size={28} color={colorScheme?.text} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  deleteButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  animatedContainer: {
    width: "100%",
    height: "100%",
  },
  imageTouchable: {
    width: "100%",
    height: "100%",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  imageCounter: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  navigationContainer: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  navButton: {
    padding: 20,
  },
});
