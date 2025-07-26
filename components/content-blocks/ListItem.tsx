import { ChecklistItem } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { memo, useEffect, useRef } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface ListItemProps {
  focus: boolean;
  item: ChecklistItem;
  index: number;
  colorScheme: any;
  addItem: (index: number) => void;
  removeItem: (id: number) => void;
  onItemCheck: (id: string) => void;
  onItemChangeText: (id: string, text: string) => void;
}

function ListItem({
  focus,
  item,
  index,
  onItemCheck,
  onItemChangeText,
  addItem,
  removeItem,
  colorScheme,
}: ListItemProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (focus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [focus]);

  return (
    <View className="flex-row items-start px-2">
      <TouchableOpacity className="pt-1.5" onPress={() => onItemCheck(item.id)}>
        <Ionicons
          name={item.checked ? "checkbox" : "square-outline"}
          size={24}
          color={colorScheme?.checkbox}
        />
      </TouchableOpacity>
      <TextInput
        ref={inputRef}
        className={`ml-1 flex-1 overflow-clip my-[-3]`}
        style={{
          color: colorScheme?.text,
          textDecorationLine: item.checked ? "line-through" : "none",
          textAlignVertical: "top",
        }}
        value={item.text}
        onChangeText={(text) => onItemChangeText(item.id, text)}
        onSubmitEditing={() => addItem(index)}
        onKeyPress={(e) => {
          if (e.nativeEvent.key === "Backspace") {
            if (item.text.length === 0 && index !== 0) removeItem(index);
          }
        }}
      />
    </View>
  );
}

export default memo(ListItem);
