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

import { ContentBlock, ContentType } from "@/types";
import { convertAndFormatUTC, isPlatformWeb } from "@/lib/utils";
import useTheme from "@/lib/themes";
import useNote from "@/hooks/useNote";
import NoteHeader from "@/components/NoteHeader";
import NoteToolbar from "@/components/NoteToolbar";
import BlockOptionsModal from "@/components/BlockOptionsModal";
import { AudioRecordingModal } from "@/components/AudioRecordingModal";
import { ChecklistBlock } from "@/components/content-blocks/ChecklistBlock";
import { AudioBlock } from "@/components/content-blocks/AudioBlock";
import { TextBlock } from "@/components/content-blocks/TextBlock";
import ImagesContainer from "@/components/ImagesContainer";

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
  const [audioPlaying, setAudioPlaying] = useState<string>();

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

  const handleEditBlockProps = (id: string, name: string) => {
    // Modal de edicion de props
  };

  const onToolbarOptionSelected = (type: ContentType) => {
    switch (type) {
      case ContentType.CHECKLIST:
        addNewContentBlock(ContentType.CHECKLIST, [{ items: [], title: "" }]);
        break;
      case ContentType.AUDIO:
        setAudioPlaying(undefined);
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

  const handleAudioPlay = (id: string) => setAudioPlaying(id);

  const handleAudioEnd = (id: string) => {
    const nextIndex = content.findIndex((b) => b.id === id) + 1;

    // Al terminar un audio comienza a reproducir el siquiente
    if (
      nextIndex < content.length &&
      content[nextIndex].type === ContentType.AUDIO
    ) {
      setAudioPlaying(content[nextIndex].id);
      return;
    }

    setAudioPlaying(undefined);
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
            maxPerRow={4}
            onUpdate={handleUpdateBlock}
            // onEditProp={handleEditBlockProps}
            onDelete={handleDeleteBlock}
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
          console.log("audio. " + blockOrGroup.props.uploadedAt);
          return (
            <AudioBlock
              key={blockOrGroup.id}
              audioPlaying={audioPlaying}
              block={blockOrGroup}
              playbackStart={handleAudioPlay}
              playbackEnd={handleAudioEnd}
              openOptions={handleOpenOptionsModal}
            />
          );
        default:
          return null;
      }
    },
    [groupedContent, audioPlaying]
  );

  // console.log(`id: ${id}`);

  if (!id) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-950">
        <Text className="text-center font-semibold text-2xl text-slate-50">
          {"Selecciona una nota para continuar editando \no\nCrea una nueva"}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1`}
      style={{ backgroundColor: colorScheme?.secondary }}
    >
      {/* Header */}
      <NoteHeader
        title={title}
        updateTitle={handleUpdateTitle}
        submitTitle={handleTitleSubmit}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className={`flex-1 ${isPlatformWeb ? "flex-row" : ""}`}
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
          contentContainerClassName="px-4"
          ListHeaderComponent={() =>
            createdAt && (
              <Text
                className="text-center text-xs opacity-50"
                style={{ color: colorScheme!.text }}
              >
                Creado {convertAndFormatUTC(createdAt)}
              </Text>
            )
          }
          maxToRenderPerBatch={5}
          initialNumToRender={5}
          windowSize={5}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={1000}
        />
      </KeyboardAvoidingView>
      {/* Toolbar */}
      <View className="items-center">
        <NoteToolbar
          onAddContentBlock={onToolbarOptionSelected}
          onSave={() => handleSave(true)}
        />
      </View>

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
        editBlockProps={handleEditBlockProps}
      />
    </SafeAreaView>
  );
}
