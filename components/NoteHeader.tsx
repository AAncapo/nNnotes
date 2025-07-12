/* eslint-disable prettier/prettier */
import useTheme from "@/lib/themes";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface HeaderProps {
  title: string;
  updateTitle: (title: string) => void;
  submitTitle: () => void;
  onMain: () => void;
}

function NoteHeader({ title, updateTitle, submitTitle, onMain }: HeaderProps) {
  const colorScheme = useTheme(useColorScheme());
  return (
    <>
      <StatusBar
        style={useColorScheme() === "dark" ? "light" : "dark"}
        backgroundColor={colorScheme?.secondary}
      />
      <View
        className={`flex-row items-center justify-between p-4`}
        style={{ backgroundColor: colorScheme?.secondary }}
      >
        {/* Back */}
        {/* <TouchableOpacity onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={colorScheme?.icons} />
        </TouchableOpacity> */}
        {/* Title */}
        <TextInput
          className={`mx-4 flex-1 text-center text-xl font-semibold`}
          style={{ color: colorScheme?.text }}
          defaultValue={title}
          onChangeText={updateTitle}
          placeholder="Añade un título"
          placeholderTextColor={"gray"}
          onSubmitEditing={submitTitle}
        />
        <TouchableOpacity onPress={onMain}>
          <Ionicons
            name="checkmark-sharp"
            size={24}
            color={colorScheme?.icons}
          />
        </TouchableOpacity>
      </View>
    </>
  );
}

export default NoteHeader;
