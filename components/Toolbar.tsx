import { Text, TouchableOpacity, View } from "react-native";
import { PropsWithChildren, ReactNode } from "react";

import useTheme from "@/hooks/useTheme";
import { isPlatformWeb } from "@/lib/utils";
import { Close, Delete, Pin, PinOff, Tags } from "./common/Icons";

interface ToolbarProps {
  selectedCount: number;
  isPinned: boolean;
  handleDelete: () => void;
  handlePin: () => void;
  handleTags: () => void;
  onClose: () => void;
}

function Toolbar({
  selectedCount,
  isPinned,
  handleDelete,
  handlePin,
  handleTags,
  onClose,
}: ToolbarProps) {
  const { colors } = useTheme();
  return (
    <View
      className={`flex-row w-full h-16 px-4 items-center justify-around absolute bottom-0`}
      style={{ backgroundColor: isPlatformWeb ? "" : colors.background }}
    >
      <Text className="flex-1 text-lg">{selectedCount} selected</Text>
      <View className="flex-row">
        <ToolBarButton onPressed={handleDelete}>
          {/* <Ionicons name="mic" size={22} color={colorScheme?.icons} /> */}
          <Delete />
        </ToolBarButton>
        <ToolBarButton onPressed={handlePin}>
          {/* <Ionicons name="image" size={24} color={colorScheme?.icons} /> */}
          {isPinned ? <Pin /> : <PinOff />}
        </ToolBarButton>
        <ToolBarButton onPressed={handleTags}>
          {/* <Ionicons name="image" size={24} color={colorScheme?.icons} /> */}
          <Tags />
        </ToolBarButton>
        <ToolBarButton onPressed={onClose}>
          <Close />
          {/* <Ionicons name="image" size={24} color={colorScheme?.icons} /> */}
        </ToolBarButton>
      </View>
    </View>
  );
}

export default Toolbar;

type ToolBarButtonProps = {
  children: ReactNode;
  onPressed: () => void;
} & PropsWithChildren;

const ToolBarButton = ({ children, onPressed }: ToolBarButtonProps) => (
  <TouchableOpacity
    activeOpacity={0.2}
    className={`${isPlatformWeb ? "" : "h-full"} p-4 items-center justify-center`}
    onPress={onPressed}
  >
    {children}
  </TouchableOpacity>
);
