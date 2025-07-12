import { ChecklistItem } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { memo, useEffect, useRef } from "react";
import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
    <View className="flex-row items-center p-2">
      <TouchableOpacity onPress={() => onItemCheck(item.id)}>
        <Ionicons
          name={item.checked ? "checkbox" : "square-outline"}
          size={24}
          color={colorScheme?.checkbox}
        />
      </TouchableOpacity>
      <TextInput
        ref={inputRef}
        className={`ml-2 flex-1 ${item.checked ? "line-through" : ""}`}
        style={{ color: colorScheme?.text }}
        value={item.text}
        // placeholder="Checklist item"
        onChangeText={(text) => onItemChangeText(item.id, text)}
        onSubmitEditing={() => addItem(index)}
        onKeyPress={(e) => {
          if (e.nativeEvent.key === "Backspace") {
            if (item.text.length === 0 && index !== 0) removeItem(index);
          }
        }}
      />
      <Pressable onPress={() => removeItem(index)}>
        <Text
          className="text-center font-semibold text-sm"
          style={{ color: colorScheme?.text }}
        >
          x
        </Text>
      </Pressable>
    </View>
  );
}

export default memo(ListItem);
