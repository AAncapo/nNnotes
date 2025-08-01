import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  useColorScheme,
  TextInput,
} from "react-native";

import useRecorder from "@/hooks/useAudioRecorder";
import { BlockProps } from "@/types";
import useTheme from "@/lib/themes";

interface AudioRecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (props: Partial<BlockProps>) => void;
}

export function AudioRecordingModal({
  visible,
  onClose,
  onSave,
}: AudioRecordingModalProps) {
  const colorScheme = useTheme(useColorScheme());
  const {
    recording,
    isRecording,
    isPaused,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useRecorder();
  const [title, setTitle] = useState<string>("");

  const handleSave = async () => {
    if (!recording) return;

    await stopRecording();

    const uri = recording.getURI();
    if (uri) {
      onSave({ uri, duration, title });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View
          className={`w-4/5 rounded-xl p-6`}
          style={{ backgroundColor: colorScheme?.background }}
        >
          <View className="mb-6 items-center">
            <TextInput
              className="mb-2 w-full rounded-md border border-slate-200 p-2 text-center text-xl"
              style={{ color: colorScheme?.text }}
              placeholder="Título"
              placeholderTextColor={"#eee"}
              onChangeText={setTitle}
            />
            <Text
              className={`text-xl font-bold`}
              style={{ color: colorScheme?.text }}
            >
              {formatTime(duration)}
            </Text>
          </View>

          <View className="mb-6 flex-row justify-around">
            <TouchableOpacity
              className={`rounded-full p-4`}
              style={{ backgroundColor: colorScheme?.icons }}
              onPress={
                isRecording
                  ? isPaused
                    ? resumeRecording
                    : pauseRecording
                  : startRecording
              }
            >
              <Ionicons
                name={isRecording ? (isPaused ? "play" : "pause") : "mic"}
                size={32}
                color={colorScheme?.iconButton}
              />
            </TouchableOpacity>

            {isRecording && (
              <TouchableOpacity
                className="rounded-full bg-red-500 p-4"
                onPress={stopRecording}
              >
                <Ionicons name="stop" size={32} color="white" />
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row justify-between">
            <TouchableOpacity className="p-3" onPress={onClose}>
              <Text
                className={`text-lg font-bold`}
                style={{ color: colorScheme?.text }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            {isRecording && (
              <TouchableOpacity className="p-3" onPress={handleSave}>
                <Text className="text-lg font-bold text-blue-500">Save</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
