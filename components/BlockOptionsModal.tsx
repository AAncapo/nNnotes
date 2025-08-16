/* eslint-disable prettier/prettier */
import { Ionicons } from "@expo/vector-icons";
import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";

import { ContentType } from "@/types";
import useTheme from "@/hooks/useTheme";

interface BlockOptionsModalProps {
  type: ContentType;
  id: string;
  visible: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

function BlockOptionsModal({
  id,
  visible,
  type,
  onClose,
  onDelete,
}: BlockOptionsModalProps) {
  const { colors } = useTheme();

  const handleDelete = () => {
    Alert.alert("Delete audio file", "Do you want to delete this audio file?", [
      { text: "CANCEL" },
      { text: "CONFIRM", onPress: () => onDelete(id) },
    ]);
  };

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center">
        <View
          className={`rounded-xl p-4 gap-4`}
          style={{ backgroundColor: colors.background }}
        >
          <View className="flex-row justify-end">
            <TouchableOpacity className="p-2 self-end" onPress={onClose}>
              <Text className="font-semibold" style={{ color: colors.text }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 border-2 border-red-500 rounded-xl p-4"
            onPress={() => {
              handleDelete();
              onClose();
            }}
          >
            <Ionicons name="trash" size={20} color="#ef4444" />
            <Text className="text-xl font-semibold text-red-500">
              Delete {type}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default BlockOptionsModal;
