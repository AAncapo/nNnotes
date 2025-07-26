import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { PropsWithChildren, ReactNode } from "react";

import { ContentType } from "@/types";
import useTheme from "@/lib/themes";
import { isPlatformWeb } from "@/lib/utils";

interface ToolbarProps {
  onSave: () => void;
  onAddContentBlock: (type: ContentType) => void;
}

function NoteToolbar({ onAddContentBlock, onSave }: ToolbarProps) {
  const colorScheme = useTheme(useColorScheme());
  return (
    <View
      className={`${isPlatformWeb ? "flex-1" : "flex-row w-full h-14 px-4"} items-center justify-center`}
      style={{ backgroundColor: isPlatformWeb ? "" : colorScheme?.background }}
    >
      <View className="flex-1 p-4">{/* Text options? */}</View>
      <View
        className={`${isPlatformWeb ? "" : "flex-row"} justify-between items-center`}
      >
        <ToolBarButton
          type={ContentType.CHECKLIST}
          onSelected={onAddContentBlock}
        >
          <Ionicons name="list" size={24} color={colorScheme?.icons} />
        </ToolBarButton>
        <ToolBarButton type={ContentType.AUDIO} onSelected={onAddContentBlock}>
          <Ionicons name="mic" size={24} color={colorScheme?.icons} />
        </ToolBarButton>
        <ToolBarButton type={ContentType.IMAGE} onSelected={onAddContentBlock}>
          <Ionicons name="image" size={24} color={colorScheme?.icons} />
        </ToolBarButton>
      </View>
      <TouchableOpacity className="flex-1 p-4 items-end" onPress={onSave}>
        <Ionicons name="checkmark-sharp" size={24} color={colorScheme?.icons} />
      </TouchableOpacity>
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
    className={`${isPlatformWeb ? "" : "h-full"} p-4 items-center justify-center`}
    onPress={() => onSelected(type)}
  >
    {children}
  </TouchableOpacity>
);
