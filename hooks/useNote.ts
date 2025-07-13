/* eslint-disable prettier/prettier */
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import { useNotesStore } from "@/store/useNotesStore";
import { BlockProps, ContentBlock, ContentType } from "@/types";
import { isPlatformWeb } from "@/lib/utils";

const textPlaceholder = "Comienza a escribir ...";

function useNote(id?: string) {
  const isNewNote = !id || id === "new";
  const { getNote, addNote, updateNote } = useNotesStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [createdAt, setCreatedAt] = useState("");
  const [note, setNote] = useState();

  useEffect(() => {
    if (!isNewNote) {
      const existingNote = getNote(id);
      if (existingNote) {
        setCreatedAt(existingNote.createdAt);
        setTitle(existingNote.title);
        setContent(existingNote.content);
      }
    } else {
      if (content.length === 0) {
        addNewContentBlock(ContentType.TEXT, {
          text: "",
          placeholder: textPlaceholder,
          isExpanded: true,
          focus: false,
        });
      }
    }
  }, [isNewNote, id]);

  const handleGoBack = () => {
    if (isPlatformWeb) {
      router.replace("/notes");
    } else {
      router.back();
    }
  };

  const handleSave = (goBack?: boolean) => {
    // Descartar nota vacia
    const isBlank =
      !title.length && content.length === 1 && !content[0].props.text;
    if (isBlank) {
      console.log("Nota vacía descartada");
      goBack && handleGoBack();
      return;
    }

    if (!hasChanges) return;
    if (!isNewNote) {
      updateNote(id as string, { title, content });
    } else {
      addNote({ title, content });
    }
    goBack && handleGoBack();
  };

  const addNewContentBlock = (
    type: ContentType,
    { ...props }: Partial<BlockProps> | undefined
  ) => {
    let newBlock: ContentBlock | null = null;
    switch (type) {
      case ContentType.TEXT:
        newBlock = {
          id: Date.now().toString(),
          type,
          props: {
            ...props,
          },
        };
        break;
      case ContentType.CHECKLIST:
        newBlock = {
          id: Date.now().toString(),
          type,
          props: {
            items: [{ id: Date.now().toString(), text: "", checked: false }],
          },
        };
        break;
      case ContentType.IMAGE:
        newBlock = {
          id: Date.now().toString(),
          type,
          props: {
            ...props,
          },
        };
        break;
      case ContentType.AUDIO:
        console.log("saving audio...", props.uri);
        newBlock = {
          id: Date.now().toString(),
          type,
          props: {
            title: props.title,
            uri: props.uri,
            duration: props.duration,
            createdAt: new Date().toISOString(),
          },
        };
        break;
      default:
        break;
    }

    // Shrink the previous last block if it was expanded (or any other expanded block)
    const updatedContent = content.map((block) =>
      block.props.isExpanded
        ? { ...block, props: { ...block.props, isExpanded: false } }
        : block
    );

    let newContent: ContentBlock[] = [...updatedContent];

    // Borra último block (anterior al nuevo) si es texto vacío
    if (updatedContent.length > 0) {
      const lastBlock = updatedContent[updatedContent.length - 1];
      if (
        lastBlock.type === ContentType.TEXT &&
        !lastBlock.props.text?.length
      ) {
        newContent.pop();
      }
    }

    if (newBlock) {
      newContent.push(newBlock);
      if (type !== ContentType.TEXT) {
        // Añade un text seguido del block si el añadido no es tipo text
        newContent.push({
          id: Date.now().toString() + "new",
          type: ContentType.TEXT,
          props: {
            isExpanded: true,
            focus: false,
            text: "",
            placeholder: "",
          },
        });
      }
      setContent([...newContent]);
    }

    if (!hasChanges) setHasChanges(true);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      addNewContentBlock(ContentType.IMAGE, {
        text: "Image",
        uri: result.assets[0].uri,
      });
    }
  };

  const handleUpdateBlock = (updatedBlock: ContentBlock) => {
    const newContent = content.map((block) =>
      block.id === updatedBlock.id ? updatedBlock : block
    );
    setContent(newContent);
    if (!hasChanges) setHasChanges(true);
  };

  const handleDeleteBlock = (blockId: string) => {
    const deleteIndex = content.findIndex((b) => b.id === blockId);
    if (content[deleteIndex].type === ContentType.TEXT) {
      // Si es un texto...
      if (content.length <= 1) {
        // Si es el primer block...
        // TODO: Enfocar siguiente si es texto

        console.log("No puede eliminar el primer texto onBackspace");
        return;
      }

      if (
        deleteIndex > 0 &&
        content[deleteIndex - 1].type === ContentType.TEXT
      ) {
        // TODO: Enfocar anterior primero
        console.log(
          "TODO: Enfocar texto anterior antes de borrar seleccionado"
        );
      }
    }

    const newContent = content.filter((block) => block.id !== blockId);
    if (newContent.length === 0) {
      // Si block borrado es el primero y la nota va a quedar vacia add texto default
      // Esto no debería suceder ya que siempre habrá una nota de texto al final
      addNewContentBlock(ContentType.TEXT, {
        text: "",
        placeholder: textPlaceholder,
        isExpanded: true,
        focus: false,
      });
    }

    setContent(newContent);
  };

  const handleUpdateTitle = (newTitle: string) => {
    if (title === newTitle) return;
    setTitle(newTitle);
    if (!hasChanges) setHasChanges(true);
  };

  const handleTitleSubmit = () => {
    // Create text block if content is empty
    const defaultBlock =
      content.length === 1 && content[0].type === ContentType.TEXT
        ? content[0]
        : null;
    if (defaultBlock && defaultBlock.props.text === "") {
      setContent([
        { ...defaultBlock, props: { ...defaultBlock.props, focus: true } },
      ]);
    }
  };
  return {
    title,
    content,
    hasChanges,
    handleGoBack,
    handleSave,
    addNewContentBlock,
    handleUpdateBlock,
    handleUpdateTitle,
    handleTitleSubmit,
    handleDeleteBlock,
    handlePickImage,
    createdAt,
  };
}

export default useNote;
