/* eslint-disable prettier/prettier */
import { Ionicons } from "@expo/vector-icons";
import {
  ColorSchemeName,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { ContentType } from "@/types";
import { getIconColor } from "@/lib/utils";
import useTheme from "@/lib/themes";

interface ToolbarProps {
  onOptionSelected: (type: ContentType) => void;
}

function NoteToolbar({ onOptionSelected }: ToolbarProps) {
  const colorScheme = useTheme(useColorScheme());
  return (
    <View
      className={`h-16 flex-row items-center justify-around border-t p-4 py-0`}
      style={{ backgroundColor: colorScheme?.background }}
    >
      <TouchableOpacity
        disabled
        activeOpacity={0.2}
        className="h-full flex-1 items-center justify-center"
        onPress={() => onOptionSelected(ContentType.CHECKLIST)}
      >
        <Ionicons name="list" size={24} color={colorScheme?.icons} />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.2}
        className="h-full flex-1 items-center justify-center"
        onPress={() => onOptionSelected(ContentType.AUDIO)}
      >
        <Ionicons name="mic" size={24} color={colorScheme?.icons} />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.2}
        className="h-full flex-1 items-center justify-center"
        onPress={() => onOptionSelected(ContentType.IMAGE)}
      >
        <Ionicons name="image" size={24} color={colorScheme?.icons} />
      </TouchableOpacity>
    </View>
  );
}

export default NoteToolbar;
