import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { memo, useMemo } from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

import { ContentType, Note } from "@/types";
import { convertAndFormatUTC, isPlatformWeb } from "@/lib/utils";
import useTheme from "@/lib/themes";

interface NoteCardProps {
  note: Note;
  onLongPress: (id: string) => void;
}

function NoteCard({ note, onLongPress }: NoteCardProps) {
  const colorScheme = useTheme(useColorScheme());
  const { id, title, isPinned, updatedAt } = note;
  const parsedUpdatedAt = convertAndFormatUTC(updatedAt);

  const renderSubtitle = useMemo(() => {
    const cblock = note.content.length > 0 ? note.content[0] : null;
    if (!cblock) return "<undefined>";
    switch (cblock?.type) {
      case ContentType.TEXT:
        return cblock.props.text !== "" ? cblock.props.text : "<empty>";
      case ContentType.AUDIO:
        return cblock.props.title || "Audio";
      case ContentType.IMAGE:
        return "Imagen";
      case ContentType.CHECKLIST:
        const checkedItems = cblock.props.items?.filter(
          (i) => i.checked
        ).length;
        return `Checklist (${checkedItems + "/" + cblock.props.items?.length})`;
      // return cblock.props.title !== ""
      //   ? cblock.props.title
      //   : cblock.props.items!.length > 0 && cblock.props.items![0].text !== ""
      //     ? cblock.props.items![0].text
      //     : "Checklist";
      default:
        return "<unknown>";
    }
    // <MaterialIcons name="music-note" size={24} color="black" />;
  }, [note]);

  return (
    <TouchableOpacity
      className={`py-2 ${useColorScheme() === "dark" ? "border-gray-800" : "border-gray-200"} border-b`}
      style={{ borderColor: colorScheme?.separator }}
      onPress={() =>
        isPlatformWeb
          ? router.setParams({ id })
          : router.push({ pathname: "/note/[id]", params: { id } })
      }
      onLongPress={() => onLongPress(note.id)}
      // delayLongPress={0}
    >
      <View className="flex-row justify-between">
        {/* Title */}
        <Text
          className={`font-semibold text-lg ${useColorScheme() === "dark" ? "text-white" : "text-gray-800"} flex text-ellipsis`}
          numberOfLines={1}
        >
          {title === "" ? renderSubtitle : title}
        </Text>
        {/* Pin */}
        {isPinned && (
          <View className="opacity-30">
            <MaterialCommunityIcons
              name="pin"
              size={18}
              color={colorScheme?.icons}
            />
          </View>
        )}
      </View>
      {/* Subtitle */}
      <Text
        className={`max-h-16 text-sm ${useColorScheme() === "dark" ? "text-gray-400" : "text-gray-500"} flex text-ellipsis line-clamp-${isPinned ? 1 : 2} overflow-hidden`}
      >
        {renderSubtitle}
      </Text>
      {/* UpdatedAt */}
      <View className="flex-row justify-between">
        <Text
          className={`py-1 pt-2 text-xs ${useColorScheme() === "dark" ? "text-gray-500" : "text-gray-400"} line-clamp-1 overflow-clip`}
        >
          {parsedUpdatedAt}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default memo(NoteCard);
