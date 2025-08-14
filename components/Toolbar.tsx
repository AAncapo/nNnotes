import { Text, TouchableOpacity, View } from "react-native";
import { PropsWithChildren, ReactNode } from "react";

import useTheme from "@/hooks/useTheme";
import { isPlatformWeb } from "@/lib/utils";
import { Close, Delete, Pin, PinOff, Tags } from "./common/Icons";

interface ToolbarProps {
  isPinned: boolean;
  handleDelete: () => void;
  handlePin: () => void;
  handleTags: () => void;
  onClose: () => void;
}

function Toolbar({
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
      <ToolBarButton onPressed={handleDelete}>
        <Delete color={colors.icon} />
      </ToolBarButton>
      <ToolBarButton onPressed={handlePin}>
        {!isPinned ? (
          <Pin color={colors.icon} />
        ) : (
          <PinOff color={colors.icon} />
        )}
      </ToolBarButton>
      <ToolBarButton onPressed={handleTags}>
        <Tags color={colors.icon} />
      </ToolBarButton>
      <ToolBarButton onPressed={onClose}>
        <Close color={colors.icon} />
      </ToolBarButton>
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
