/* eslint-disable prettier/prettier */
import useTheme from "@/lib/themes";
import { StatusBar } from "expo-status-bar";
import { TextInput, useColorScheme, View } from "react-native";

interface HeaderProps {
  title: string;
  updateTitle: (title: string) => void;
  submitTitle: () => void;
}

function NoteHeader({ title, updateTitle, submitTitle }: HeaderProps) {
  const colorScheme = useTheme(useColorScheme());
  return (
    <>
      <StatusBar
        style={useColorScheme() === "dark" ? "light" : "dark"}
        backgroundColor={colorScheme?.secondary}
      />
      <View
        className={`flex-row items-center justify-between px-4 py-1`}
        // style={{ backgroundColor: colorScheme?.secondary }}
      >
        {/* Title */}
        <TextInput
          className={`mx-4 flex-1 text-center text-xl font-semibold`}
          style={{ color: colorScheme?.text }}
          defaultValue={title}
          onChangeText={updateTitle}
          placeholder="Título"
          placeholderTextColor={"gray"}
          onSubmitEditing={submitTitle}
        />
      </View>
    </>
  );
}

export default NoteHeader;
