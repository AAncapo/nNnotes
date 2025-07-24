import { useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  FlatList,
  BackHandler,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AudioRecordingModal } from "@/components/AudioRecordingModal";
import BlockOptionsModal from "@/components/BlockOptionsModal";
import NoteHeader from "@/components/NoteHeader";
import NoteToolbar from "@/components/NoteToolbar";
import { AudioBlock } from "@/components/content-blocks/AudioBlock";
import { ChecklistBlock } from "@/components/content-blocks/ChecklistBlock";
import { TextBlock } from "@/components/content-blocks/TextBlock";
import ImagesContainer from "@/components/ImagesContainer";
import useNote from "@/hooks/useNote";
import { ContentBlock, ContentType } from "@/types";
import { convertAndFormatUTC, isPlatformWeb } from "@/lib/utils";
import useTheme from "@/lib/themes";

// darkNoteBg gray-950

export default function NoteDetails() {
  const colorScheme = useTheme(useColorScheme());
  const { id } = useLocalSearchParams<{ id?: string }>();
  const {
    title,
    content,
    hasChanges,
    handleUpdateTitle,
    handleTitleSubmit,
    handleSave,
    addNewContentBlock,
    handleUpdateBlock,
    handleDeleteBlock,
    handlePickImage,
    createdAt,
  } = useNote(id);
  const [isRecordingModalVisible, setIsRecordingModalVisible] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] =
    useState<boolean>(false);
  const [optionsId, setOptionsId] = useState<string | null>(null);

  // Handle hardware BACK button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (hasChanges) handleSave();
        return false; // Allow default behavior
      }
    );

    return () => backHandler.remove();
  }, [title, content, hasChanges]);

  const handleOpenOptionsModal = (id: string) => {
    setOptionsId(id);
    setOptionsModalVisible(true);
  };

  const onToolbarOptionSelected = (type: ContentType) => {
    switch (type) {
      case ContentType.CHECKLIST:
        addNewContentBlock(ContentType.CHECKLIST, [{ items: [], title: "" }]);
        break;
      case ContentType.AUDIO:
        setIsRecordingModalVisible(true);
        break;
      case ContentType.IMAGE:
        handlePickImage();
        break;
      default:
        break;
    }
  };

  const groupConsecutiveImages = (blocks: ContentBlock[]) => {
    const groupedBlocks: (ContentBlock | ContentBlock[])[] = [];
    let currentImageGroup: ContentBlock[] = [];

    blocks.forEach((block, index) => {
      if (block.type === ContentType.IMAGE) {
        currentImageGroup.push(block);

        // Si el siguiente bloque no es imagen o es el último, cierra el grupo
        if (
          index === blocks.length - 1 ||
          blocks[index + 1].type !== ContentType.IMAGE
        ) {
          groupedBlocks.push([...currentImageGroup]);
          currentImageGroup = [];
        }
      } else {
        if (currentImageGroup.length > 0) {
          groupedBlocks.push([...currentImageGroup]);
          currentImageGroup = [];
        }
        groupedBlocks.push(block);
      }
    });

    return groupedBlocks;
  };

  const groupedContent = useMemo(
    () => groupConsecutiveImages(content),
    [content]
  );

  const renderGroupedContentBlock = useCallback(
    ({
      item: blockOrGroup,
      index,
    }: {
      item: ContentBlock | ContentBlock[];
      index: number;
    }) => {
      // Si es un grupo de imágenes
      if (Array.isArray(blockOrGroup)) {
        return (
          <ImagesContainer
            key={`image-group-${blockOrGroup[0].id}`}
            images={blockOrGroup}
            onDelete={handleDeleteBlock}
            maxPerRow={4} // o 4 según prefieras
          />
        );
      }

      // Si es un bloque individual
      switch (blockOrGroup.type) {
        case ContentType.TEXT:
          return (
            <TextBlock
              key={blockOrGroup.id}
              block={blockOrGroup}
              onUpdate={handleUpdateBlock}
              onDelete={handleDeleteBlock}
              focus={blockOrGroup.props.focus}
              isLast={index === groupedContent.length - 1}
            />
          );
        case ContentType.CHECKLIST:
          return (
            <ChecklistBlock
              key={blockOrGroup.id}
              block={blockOrGroup}
              onUpdate={handleUpdateBlock}
            />
          );
        case ContentType.AUDIO:
          return (
            <AudioBlock
              key={blockOrGroup.id}
              block={blockOrGroup}
              openOptions={handleOpenOptionsModal}
            />
          );
        default:
          return null;
      }
    },
    [groupedContent]
  );

  console.log(`id: ${id}`);

  return id !== undefined ? (
    <SafeAreaView
      className={`flex-1`}
      style={{ backgroundColor: colorScheme?.secondary }}
    >
      {/* Header */}
      <NoteHeader
        title={title}
        updateTitle={handleUpdateTitle}
        submitTitle={handleTitleSubmit}
        onMain={() => handleSave(true)}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className={`flex-1 relative ${isPlatformWeb ? "flex-row" : ""}`}
      >
        {/* Content */}
        <FlatList
          data={groupedContent}
          renderItem={renderGroupedContentBlock}
          keyExtractor={(item) => {
            if (Array.isArray(item)) {
              return `image-group-${item[0].id}`;
            }
            return `block-${item.id}`;
          }}
          alwaysBounceVertical
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-4 flex-grow"
          ListFooterComponent={() =>
            createdAt && (
              <Text
                className="p-4 pt-20 text-center"
                style={{ color: colorScheme!.text }}
              >
                Creado {convertAndFormatUTC(createdAt)}
              </Text>
            )
          }
        />
        {/* Toolbar */}
        <View className="items-center">
          <NoteToolbar onOptionSelected={onToolbarOptionSelected} />
        </View>
      </KeyboardAvoidingView>

      {/* Modals */}
      <AudioRecordingModal
        visible={isRecordingModalVisible}
        onClose={() => setIsRecordingModalVisible(false)}
        onSave={(props) => {
          setIsRecordingModalVisible(false);

          addNewContentBlock(ContentType.AUDIO, [props]);
        }}
      />
      <BlockOptionsModal
        type={ContentType.AUDIO}
        id={optionsId || ""}
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        onDelete={handleDeleteBlock}
      />
    </SafeAreaView>
  ) : (
    <View className="flex-1 justify-center items-center bg-gray-950">
      <Text className="text-center font-semibold text-2xl text-slate-50">
        {"Selecciona una nota para continuar editando \no\nCrea una nueva"}
      </Text>
    </View>
  );
}
