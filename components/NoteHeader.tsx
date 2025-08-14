import useTheme from "@/hooks/useTheme";
import { ContentType } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { PropsWithChildren, ReactNode } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title: string;
  onAddContentBlock: (type: ContentType) => void;
  updateTitle: (title: string) => void;
  submitTitle: () => void;
}

function NoteHeader({
  title,
  onAddContentBlock,
  updateTitle,
  submitTitle,
}: HeaderProps) {
  const { colors, theme } = useTheme();
  return (
    <>
      <StatusBar
        style={theme === "dark" ? "light" : "dark"}
        backgroundColor={colors.secondary}
      />
      <View className={`flex-row items-center justify-around px-4 py-1`}>
        <View className=""></View>
        {/* Title */}
        <TextInput
          className={`text-center text-xl font-semibold`}
          style={{ color: colors.text }}
          defaultValue={title}
          onChangeText={updateTitle}
          placeholder="Título"
          placeholderTextColor={"gray"}
          onSubmitEditing={submitTitle}
          numberOfLines={1}
        />
        <View
          className={`flex-row items-center`}
          style={{ backgroundColor: colors.secondary }}
        >
          {/* <ToolBarButton
            type={ContentType.CHECKLIST}
            onSelected={onAddContentBlock}
          >
            <Ionicons
              name="checkbox-outline"
              size={22}
              color={colors.icons}
            />
          </ToolBarButton> */}
          <ToolBarButton
            type={ContentType.AUDIO}
            onSelected={onAddContentBlock}
          >
            <Ionicons name="mic" size={20} color={colors.icon} />
          </ToolBarButton>
          <ToolBarButton
            type={ContentType.IMAGE}
            onSelected={onAddContentBlock}
          >
            <Ionicons name="image-outline" size={20} color={colors.icon} />
          </ToolBarButton>
        </View>
      </View>
    </>
  );
}

export default NoteHeader;

type ToolBarButtonProps = {
  type: ContentType;
  children: ReactNode;
  onSelected: (type: ContentType) => void;
} & PropsWithChildren;

const ToolBarButton = ({ type, children, onSelected }: ToolBarButtonProps) => (
  <TouchableOpacity
    activeOpacity={0.2}
    className={`p-2 items-center justify-center`}
    onPress={() => onSelected(type)}
  >
    {children}
  </TouchableOpacity>
);
