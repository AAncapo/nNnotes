import useTheme from "@/hooks/useTheme";
import { NoteTag } from "@/types";
import { FlatList, Text, TouchableOpacity, } from "react-native";

interface TagListProps {
  tags: NoteTag[];
  selectedTags: string[];
  onSelectedChange: (name: string) => void;
}

function TagList({ tags, selectedTags, onSelectedChange }: TagListProps) {
  const colorScheme = useTheme();

  return (
    <FlatList
      contentContainerClassName="flex-row gap-1 py-2"
      horizontal
      data={tags}
      renderItem={({ item: { name, color } }) => (
        <TouchableOpacity
          key={name}
          className="rounded-lg p-1 items-center"
          style={{
            backgroundColor: !selectedTags.includes(name.toLowerCase())
              ? color || "gray"
              : "blue",
          }}
          onPress={() => selectedTags.includes(name.toLowerCase()) onSelectedChange(name)}
        >
          <Text
            className="text-center px-1"
            style={{ color: colorScheme?.text }}
          >
            {name}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

export default TagList;
