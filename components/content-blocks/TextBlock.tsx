/* eslint-disable prettier/prettier */
import useTheme from "@/lib/themes";
import { useEffect, useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputKeyPressEventData,
  useColorScheme,
  View,
} from "react-native";
import { ContentBlock } from "types";

interface TextBlockProps {
  block: ContentBlock;
  onUpdate: (block: ContentBlock) => void;
  onDelete: (id: string) => void;
  isLast?: boolean;
  focus?: boolean;
}

export function TextBlock({
  block,
  onUpdate,
  focus,
  onDelete,
  isLast,
}: TextBlockProps) {
  const colorScheme = useTheme(useColorScheme());
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
  // console.log('isExpanded: ', block.props.isExpanded, 'isLast: ', isLast);
  const shouldExpand =
    (block.props.isExpanded && isLast) ||
    (block.props.isExpanded && isLast && isEmpty);

  return (
    <View className={`${shouldExpand ? "min-h-screen" : ""}`}>
      <TextInput
        ref={textInputRef}
        className={`flex-1 text-lg ${shouldExpand && "min-h-screen"}`}
        style={{ color: colorScheme?.text }}
        multiline
        placeholder={isLast ? block.props.placeholder : ""}
        placeholderTextColor={"gray"}
        defaultValue={block.props.text}
        onChangeText={(text) =>
          onUpdate({ ...block, props: { ...block.props, text } })
        }
        onKeyPress={(e) => handleBackspacePress(e)}
        textAlignVertical="top"
      />
    </View>
  );
}
