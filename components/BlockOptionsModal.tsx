/* eslint-disable prettier/prettier */
import { Ionicons } from '@expo/vector-icons';
import { Modal, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

import { ContentType } from '@/types';

interface BlockOptionsModalProps {
  type: ContentType;
  id: string;
  visible: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

function BlockOptionsModal({ id, visible, type, onClose, onDelete }: BlockOptionsModalProps) {
  const colorScheme = useColorScheme();
  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center">
        <View
          className={`w-4/5 rounded-xl p-6 ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-slate-200'}`}
        >
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2"
            onPress={() => {
              onDelete(id);
              onClose();
            }}
          >
            <Ionicons name="trash" size={24} color="#ef4444" />
            <Text className="text-2xl text-red-500">Delete {type}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default BlockOptionsModal;
