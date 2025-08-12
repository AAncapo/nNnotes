/* eslint-disable prettier/prettier */
import { useEffect, useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";
import { ContentBlock } from "types";
import useTheme from "@/hooks/useTheme";

interface TextBlockProps {
  block: ContentBlock;
  isLast?: boolean;
  focus?: boolean;
  onUpdate: (block: ContentBlock) => void;
  onDelete: (id: string) => void;
}

export function TextBlock({
  block,
  focus,
  isLast,
  onUpdate,
  onDelete,
}: TextBlockProps) {
  const { colors } = useTheme();
  const [isEmpty, setIsEmpty] = useState<boolean>(false);

  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (focus) {
      textInputRef.current?.focus();
    }
  }, [focus]);

  const handleBackspacePress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      if (block.props.text!.length === 0) {
        setIsEmpty(true);
        isEmpty && onDelete(block.id);
      }
    }
  };

  return (
    <View className={`${isLast && "min-h-screen"}`}>
      <TextInput
        ref={textInputRef}
        className={`text-lg ${isLast && "min-h-screen"}`}
        style={{ color: colors.text }}
        multiline
        placeholder={isLast ? block.props.placeholder : ""}
        placeholderTextColor={"gray"}
        value={block.props.text}
        onChangeText={(text) =>
          onUpdate({ ...block, props: { ...block.props, text } })
        }
        onKeyPress={(e) => handleBackspacePress(e)}
        textAlignVertical="top"
      />
    </View>
  );
}
