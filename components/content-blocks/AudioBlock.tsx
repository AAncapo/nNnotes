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
  audioPlaying?: string;
  playbackStart: (id: string) => void;
  playbackEnd: (id: string) => void;
  openOptions: (id: string) => void;
}

export function AudioBlock({
  block,
  audioPlaying,
  playbackStart,
  playbackEnd,
  openOptions,
}: AudioBlockProps) {
  const colorScheme = useTheme(useColorScheme());
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [playRate, setPlayRate] = useState<number>(1);

  // Carga el audio desde la memoria al reproducir por primera vez
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Play/Pause según audio actual para evitar overlaps
  // Permite que el valor de audioPlaying lo haga reproducirse
  useEffect(() => {
    if (
      (audioPlaying !== block.id && isPlaying) ||
      (audioPlaying === block.id && !isPlaying)
    ) {
      playSound();
    }
  }, [audioPlaying]);

  const playSound = async () => {
    if (!block.props.uri) return;

    // Only calls playbackStart if its neither playing or should play
    if (!isPlaying && audioPlaying !== block.id) {
      playbackStart(block.id);
    }

    try {
      if (sound) {
        if (isPlaying) await sound.pauseAsync();
        else await sound.playAsync();

        setIsPlaying(!isPlaying);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: block.props.uri },
          { shouldPlay: true, rate: playRate }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            if (status.didJustFinish) {
              playbackEnd(block.id);
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

  const changeRate = async () => {
    if (sound) {
      const newRate = playRate + 0.5 > 2 ? 1 : playRate + 0.5;
      await sound.setRateAsync(newRate, true);
      setPlayRate(newRate);
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

  const createdAt =
    (block.props.createdAt && convertAndFormatUTC(block.props.createdAt)) ||
    undefined;

  return (
    <View className="my-4 rounded-3xl bg-gray-200 p-4">
      <View className="mb-1 flex-1 flex-row items-center justify-between">
        <Text className="text-md text-ellipsis ps-2" numberOfLines={1}>
          {block.props.title || createdAt || ""}
        </Text>
        <View className="flex-row space-x-4 items-center">
          <TouchableOpacity
            className="px-1 border-2 border-slate-500 rounded-sm items-center"
            onPress={changeRate}
          >
            <Text className="font-extrabold text-sm text-slate-500 text-center">
              {playRate}X
            </Text>
          </TouchableOpacity>
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
      </View>
      <View className="flex-1 flex-row items-center">
        <TouchableOpacity className="rounded-full" onPress={playSound}>
          <Ionicons
            name={isPlaying ? "pause-circle-sharp" : "play-circle-sharp"}
            size={32}
            color={colorScheme?.iconButton}
          />
        </TouchableOpacity>

        <View className="h-1 flex-1 rounded-full bg-gray-300">
          <View
            className="h-full flex-1 rounded-full bg-black"
            style={{ width: `${Math.min(progress, 100)}%` }}
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
