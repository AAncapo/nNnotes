/* eslint-disable prettier/prettier */
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { ContentType } from "@/types";
import useTheme from "@/lib/themes";

interface BlockOptionsModalProps {
  type: ContentType;
  id: string;
  visible: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  editBlockProps: (id: string, name: string) => void;
}

function BlockOptionsModal({
  id,
  visible,
  type,
  onClose,
  onDelete,
  editBlockProps,
}: BlockOptionsModalProps) {
  const colorScheme = useTheme(useColorScheme());
  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center">
        <View
          className={`rounded-xl p-4 gap-4`}
          style={{ backgroundColor: colorScheme?.background }}
        >
          <View className="flex-row justify-end">
            <TouchableOpacity className="p-2 self-end" onPress={onClose}>
              <Text
                className="font-semibold"
                style={{ color: colorScheme?.text }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
          {type === ContentType.AUDIO && (
            <TouchableOpacity
              className="items-center justify-center gap-2 rounded-xl p-4"
              style={{ backgroundColor: colorScheme?.button }}
              onPress={() => editBlockProps(id, "title")}
            >
              <Text
                className="text-xl text-center font-semibold"
                style={{ color: colorScheme?.buttonText }}
              >
                Editar título
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 border-2 border-red-500 rounded-xl p-4"
            onPress={() => {
              onDelete(id);
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
