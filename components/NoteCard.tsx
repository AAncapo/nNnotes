/* eslint-disable prettier/prettier */
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  FontAwesome,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { memo, useMemo } from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { ContentType, Note } from "@/types";
import { convertAndFormatUTC, isPlatformWeb } from "@/lib/utils";
import useTheme from "@/lib/themes";

// type NotePreview = {
//   icon: string;
//   title: string;
//   subtitle: string;
// };

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onLongPress: () => void;
}

function NoteCard({ note, onDelete, onLongPress }: NoteCardProps) {
  const colorScheme = useTheme(useColorScheme());

  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity
        className="w-20 items-center justify-center bg-red-500"
        onPress={() => onDelete(id)}
      >
        <Ionicons name="trash" size={24} color="white" />
      </TouchableOpacity>
    );
  };

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
        return cblock.props.title !== ""
          ? cblock.props.title
          : cblock.props.items!.length > 0 && cblock.props.items![0].text !== ""
            ? cblock.props.items![0].text
            : "Checklist";
      default:
        return "<unknown>";
    }
    // <MaterialIcons name="music-note" size={24} color="black" />;
  }, []);

  // const renderPreviewIcon = ({
  //   size = 24,
  //   color = colorScheme!.icons,
  // }: {
  //   size: number;
  //   color: string;
  // }) => {
  //   const cblock = note.content.length > 0 ? note.content[0] : null;
  //   if (!cblock) return null;
  //   switch (cblock.type) {
  //     case ContentType.CHECKLIST:
  //       return <FontAwesome5 name="tasks" size={size} color={color} />;
  //     case ContentType.IMAGE:
  //       return <FontAwesome name="photo" size={size} color={color} />;
  //     case ContentType.AUDIO:
  //       return (
  //         <Ionicons name="musical-notes-sharp" size={size} color={color} />
  //       );
  //     default:
  //       return null;
  //   }
  // };

  const updatedAt = convertAndFormatUTC(note.updatedAt);

  return (
    <Swipeable renderRightActions={() => renderRightActions(note.id)}>
      <TouchableOpacity
        className={`relative py-2 ${useColorScheme() === "dark" ? "border-gray-800" : "border-gray-200"}`}
        onPress={() =>
          isPlatformWeb
            ? router.setParams({ id: note.id })
            : router.push({ pathname: "/note/[id]", params: { id: note.id } })
        }
        onLongPress={onLongPress}
      >
        {/* Title */}
        <Text
          className={`font-semibold text-md ${useColorScheme() === "dark" ? "text-white" : "text-gray-800"} flex text-ellipsis`}
          numberOfLines={1}
        >
          {note.title === "" ? renderSubtitle : note.title}
        </Text>
        {/* Subtitle */}
        {/* <View className="flex-row space-x-2 items-center">
          <View className="opacity-30">
            {renderPreviewIcon({ size: 12, color: colorScheme!.icons })}
          </View> */}
        <Text
          className={`max-h-16 text-sm ${useColorScheme() === "dark" ? "text-gray-400" : "text-gray-500"} flex text-ellipsis line-clamp-2 overflow-hidden`}
        >
          {renderSubtitle}
        </Text>
        {/* </View> */}
        <View className="flex-row justify-between">
          {/* UpdatedAt */}
          <Text
            className={`py-1 pt-2 text-xs ${useColorScheme() === "dark" ? "text-gray-500" : "text-gray-400"} line-clamp-1 overflow-clip`}
          >
            {updatedAt}
          </Text>
        </View>
        {note.isPinned && (
          <View className="absolute right-0 top-2">
            <MaterialCommunityIcons
              name="pin-outline"
              size={20}
              color={colorScheme?.icons}
            />
          </View>
        )}
      </TouchableOpacity>
      <View className="h-[1px] w-full self-center rounded-full bg-gray-200 opacity-10" />
    </Swipeable>
  );
}

export default memo(NoteCard);
