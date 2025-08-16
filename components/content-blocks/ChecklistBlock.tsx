import { useCallback, useMemo } from "react";
import { View } from "react-native";

import { ChecklistItem, ContentBlock } from "types";
import useTheme from "@/hooks/useTheme";
import ListItem from "./ListItem";

interface ChecklistBlockProps {
  block: ContentBlock;
  onUpdate: (block: ContentBlock) => void;
  onDelete: (id: string) => void;
}

export function ChecklistBlock({
  block,
  onUpdate,
  onDelete,
}: ChecklistBlockProps) {
  const { colors } = useTheme();
  const { items } = block.props;

  // const uncheckedItems = useMemo(() => {
  //   return items!.filter((i) => !i.checked) || [];
  // }, [items]);

  // const checkedItems = useMemo(() => {
  //   return items!.filter((i) => i.checked) || [];
  // }, [items]);

  const renderChecklistItem = useCallback(
    ({ item, index }: { item: ChecklistItem; index: number }) => {
      return (
        <ListItem
          key={item.id}
          focus={item.focus}
          index={index}
          item={item}
          addItem={addItem}
          colorScheme={colors}
          onItemChangeText={onItemChangeText}
          removeItem={removeItem}
          onItemCheck={onItemCheck}
        />
      );
    },
    [items]
  );

  const onItemCheck = (itemId: string) =>
    onUpdate({
      ...block,
      props: {
        ...block.props,
        items: items!.map((item) =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        ),
      },
    });

  const onItemChangeText = (itemId: string, text: string) =>
    onUpdate({
      ...block,
      props: {
        ...block.props,
        items: items!.map((item) =>
          item.id === itemId ? { ...item, text } : item
        ),
      },
    });

  const addItem = (id: string) => {
    const currentIndex = items!.findIndex((i) => i.id === id);
    if (currentIndex === -1) return;

    // Clear focus from all items first
    const clearedFocusItems = items!.map((item) => ({
      ...item,
      focus: false,
    }));

    const updatedItems = [
      ...clearedFocusItems.slice(0, currentIndex + 1),
      { id: new Date().toString(), checked: false, text: "", focus: true },
      ...clearedFocusItems.slice(currentIndex + 1),
    ];

    onUpdate({
      ...block,
      props: {
        ...block.props,
        items: [...updatedItems],
      },
    });
  };

  const removeItem = (index: number) => {
    // Eliminar contentBlock por completo, si no queda mas nada
    if (items!.length <= 1) {
      onDelete(block.id);
      return;
    }

    // Clear all focus first
    const newItems = items!
      .map((item) => ({
        ...item,
        focus: false,
      }))
      .filter((_, i) => i !== index);

    // Set focus to previous item
    if (index > 0) newItems[index - 1].focus = true;

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
      {items!.map((item, index) => renderChecklistItem({ item, index }))}
      {/* <View
        className={`h-[1px] w-5/6 self-center rounded-full opacity-10 my-1`}
        style={{ backgroundColor: colors.separator }}
      />
      {checkedItems.map((item, index) => renderChecklistItem({ item, index }))} */}
    </View>
  );
}
