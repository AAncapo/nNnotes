/* eslint-disable prettier/prettier */
import useTheme from "@/lib/themes";
import { useCallback, useMemo, useState } from "react";
import { View, TextInput, useColorScheme } from "react-native";
import { ChecklistItem, ContentBlock } from "types";
import ListItem from "./ListItem";

interface ChecklistBlockProps {
  block: ContentBlock;
  onUpdate: (block: ContentBlock) => void;
}

export function ChecklistBlock({ block, onUpdate }: ChecklistBlockProps) {
  const _colors = useTheme(useColorScheme());
  const { items, title } = block.props;

  const uncheckedItems = useMemo(() => {
    return items?.filter((i) => !i.checked) || [];
  }, [items]);

  const checkedItems = useMemo(() => {
    return items?.filter((i) => i.checked) || [];
  }, [items]);

  const renderChecklistItem = useCallback(
    ({ item, index }: { item: ChecklistItem; index: number }) => {
      return (
        <ListItem
          key={item.id}
          focus={item.focus}
          index={index}
          item={item}
          addItem={addItem}
          colorScheme={_colors}
          onItemChangeText={onItemChangeText}
          removeItem={removeItem}
          onItemCheck={onItemCheck}
        />
      );
    },
    [items]
  );

  // const handleTitleChange = (title: string) =>
  //   onUpdate({ ...block, props: { ...block.props, title } });

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
    onUpdate({
      ...block,
      props: {
        ...block.props,
        items: [
          ...items!.slice(0, currentIndex + 1),
          { id: new Date().toString(), checked: false, text: "", focus: true },
          ...items!.slice(currentIndex + 1),
        ],
      },
    });
  };

  const removeItem = (index: number) => {
    if (!items) return;
    if (items!.length <= 1) return; // No eliminar el último elemento

    // Enfocar el elemento anterior después de eliminar
    const newItems = items.map((item, index) => {
      return index === index - 1 ? { ...item, focus: true } : item;
    });

    // Remueve item
    newItems.splice(index, 1);
    onUpdate({
      ...block,
      props: {
        ...block.props,
        items: newItems,
      },
    });
  };

  return (
    <View className="py-2">
      {/* <TextInput
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
        style={{ color: _colors?.text }}
      /> */}
      {uncheckedItems.map((item, index) =>
        renderChecklistItem({ item, index })
      )}
      <View
        className={`h-[1px] w-5/6 self-center rounded-full opacity-10 my-1`}
        style={{ backgroundColor: _colors?.separator }}
      />
      {checkedItems.map((item, index) => renderChecklistItem({ item, index }))}
    </View>
  );
}
