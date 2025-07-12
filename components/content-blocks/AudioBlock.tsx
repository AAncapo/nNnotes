/* eslint-disable prettier/prettier */
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  useColorScheme,
  Alert,
} from "react-native";

import { ContentBlock } from "@/types";
import { convertAndFormatUTC } from "@/lib/utils";
import useTheme from "@/lib/themes";

interface AudioBlockProps {
  block: ContentBlock;
  openOptions: (id: string) => void;
}

export function AudioBlock({ block, openOptions }: AudioBlockProps) {
  const colorScheme = useTheme(useColorScheme());
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playSound = async () => {
    if (!block.props.uri) return;

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: block.props.uri },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
            }
          }
        });
      }
    } catch (error: any) {
      console.error("Error playing sound:", error);
      Alert.alert("Error reproduciendo audio", error.message);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${minutes}:${pad(secs)}`;
  };

  // Convert duration to milliseconds for consistent comparison
  const durationMillis = (block.props.duration || 0) * 1000;
  const progress = durationMillis > 0 ? (position / durationMillis) * 100 : 0;

  const createdAt = block.props.createdAt
    ? convertAndFormatUTC(block.props.createdAt)
    : undefined;

  return (
    <View className="my-4 rounded-3xl bg-gray-200 p-4">
      <View className="mb-1 flex-1 flex-row items-center justify-between">
        <Text className="text-md text-ellipsis ps-2" numberOfLines={1}>
          {block.props.title || createdAt || ""}
        </Text>
        <TouchableOpacity
          className="ml-4"
          onPress={() => openOptions(block.id)}
        >
          <Ionicons
            name="ellipsis-horizontal-sharp"
            size={18}
            color={colorScheme?.iconButton}
          />
        </TouchableOpacity>
      </View>
      <View className="flex-1 flex-row items-center">
        <TouchableOpacity className="rounded-full" onPress={playSound}>
          <Ionicons
            name={isPlaying ? "pause-circle-sharp" : "play-circle-sharp"}
            size={32}
            color={colorScheme?.iconButton}
          />
        </TouchableOpacity>
        <View className="ml-4 h-1 flex-1 rounded-full bg-gray-300">
          <View
            className="h-full flex-1 rounded-full bg-black"
            style={{ width: `${progress}%` }}
          />
        </View>
        <Text className="ml-2 text-sm font-semibold text-gray-600">
          {isPlaying
            ? formatTime(Number((position / 1000).toFixed(0)))
            : formatTime(block.props.duration || 0)}
        </Text>
      </View>
    </View>
  );
}
