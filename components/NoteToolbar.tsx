import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, useColorScheme, View } from "react-native";

import { ContentType } from "@/types";
import useTheme from "@/lib/themes";
import { isPlatformWeb } from "@/lib/utils";
import { PropsWithChildren, ReactNode } from "react";

interface ToolbarProps {
  onOptionSelected: (type: ContentType) => void;
}

function NoteToolbar({ onOptionSelected }: ToolbarProps) {
  const colorScheme = useTheme(useColorScheme());
  return (
    <View
      className={`${isPlatformWeb ? "flex-1" : "flex-row rounded-full h-16"} items-center justify-center`}
      style={{ backgroundColor: isPlatformWeb ? "" : colorScheme?.background }}
    >
      <ToolBarButton type={ContentType.CHECKLIST} onSelected={onOptionSelected}>
        <Ionicons name="list" size={24} color={colorScheme?.icons} />
      </ToolBarButton>
      <ToolBarButton type={ContentType.AUDIO} onSelected={onOptionSelected}>
        <Ionicons name="mic" size={24} color={colorScheme?.icons} />
      </ToolBarButton>
      <ToolBarButton type={ContentType.IMAGE} onSelected={onOptionSelected}>
        <Ionicons name="image" size={24} color={colorScheme?.icons} />
      </ToolBarButton>
    </View>
  );
}

export default NoteToolbar;

type ToolBarButtonProps = {
  type: ContentType;
  children: ReactNode;
  onSelected: (type: ContentType) => void;
} & PropsWithChildren;

const ToolBarButton = ({ type, children, onSelected }: ToolBarButtonProps) => (
  <TouchableOpacity
    activeOpacity={0.2}
    className={`${isPlatformWeb ? "" : "h-full"} p-8 items-center justify-center`}
    onPress={() => onSelected(type)}
  >
    {children}
  </TouchableOpacity>
);
