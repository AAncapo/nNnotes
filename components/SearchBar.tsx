import { Pressable, TextInput, useColorScheme, View } from "react-native";
import { useRef } from "react";

import useTheme from "@/hooks/useTheme";
import { Close, Search } from "./Icons";

interface SearchBarProps {
  value: string;
  onQueryUpdate: (text: string) => void;
}

function SearchBar({ value, onQueryUpdate }: SearchBarProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput | null>(null);
  return (
    <View
      className="w-full rounded-full relative items-center flex-row ps-3"
      style={{ backgroundColor: colors.searchbar }}
    >
      <Search color={colors.icon} />
      <TextInput
        ref={inputRef}
        value={value}
        placeholder="Search notes by title ..."
        onChangeText={onQueryUpdate}
        className="px-4 w-full"
        style={{ color: colors.text }}
        placeholderTextColor={"gray"}
      />
      {value !== "" && (
        <Pressable
          className="absolute right-0 p-4"
          onPress={() => {
            onQueryUpdate("");
            inputRef.current && inputRef.current.blur();
          }}
        >
          <Close size={18} />
        </Pressable>
      )}
    </View>
  );
}

export default SearchBar;
