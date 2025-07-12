/* eslint-disable prettier/prettier */
import useTheme from "@/lib/themes";
import { useCallback, useState } from "react";
import { View, TextInput, useColorScheme } from "react-native";
import { ChecklistItem, ContentBlock } from "types";
import ListItem from "./ListItem";

interface ChecklistBlockProps {
  block: ContentBlock;
  onUpdate: (block: ContentBlock) => void;
}

export function ChecklistBlock({ block, onUpdate }: ChecklistBlockProps) {
  const colorScheme = useTheme(useColorScheme());
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const { items, title } = block.props;

  const renderChecklistItem = useCallback(
    ({ item, index }: { item: ChecklistItem; index: number }) => {
      return (
        <ListItem
          key={item.id}
          focus={focusedIndex === index}
          index={index}
          item={item}
          addItem={addItem}
          colorScheme={colorScheme}
          onItemChangeText={onItemChangeText}
          removeItem={removeItem}
          onItemCheck={onItemCheck}
        />
      );
    },
    [items]
  );

  const handleTitleChange = (title: string) =>
    onUpdate({ ...block, props: { ...block.props, title } });

  const onItemCheck = (itemId: string) =>
    onUpdate({
      ...block,
      props: {
        ...block.props,
        items: items?.map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        ),
      },
    });

  const onItemChangeText = (itemId: string, text: string) =>
    onUpdate({
      ...block,
      props: {
        ...block.props,
        items: items?.map((item) =>
          item.id === itemId ? { ...item, text } : item
        ),
      },
    });

  const addItem = (currentIndex: number) => {
    setFocusedIndex(currentIndex + 1);
    onUpdate({
      ...block,
      props: {
        ...block.props,
        items: [
          ...items!.slice(0, currentIndex + 1),
          { id: new Date().toString(), checked: false, text: "" },
          ...items!.slice(currentIndex + 1),
        ],
      },
    });
  };

  const removeItem = (index: number) => {
    if (!items) return;
    if (items!.length <= 1) return; // No eliminar el último elemento

    // Enfocar el elemento anterior después de eliminar
    setFocusedIndex(Math.max(0, index - 1));

    const newItems = [...items];
    newItems.splice(index, 1);
    onUpdate({
      ...block,
      props: {
        ...block.props,
        items: newItems,
      },
    });
  };

  /* TODO:
  - put checked to the bottom
 */

  return (
    <View className="py-2">
      <TextInput
        className="text-base font-semibold"
        defaultValue={title}
        placeholder="Título..."
        placeholderTextColor={"gray"}
        onChangeText={handleTitleChange}
        onSubmitEditing={() => {
          // Enfocar primer item si esta vacio
          if (items?.length === 1 && items[0].text.length === 0) {
            // TODO
          }
        }}
        style={{ color: colorScheme?.text }}
      />
      {items!.map((item, index) => renderChecklistItem({ item, index }))}
      {/* toDO: checked items */}
    </View>
  );
}
