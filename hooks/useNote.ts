import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import { useNotesStore } from "@/store/useNotesStore";
import {
  BlockProps,
  ContentBlock,
  ContentType,
  Note,
  SUPABASE_BUCKET,
} from "@/types";
import {
  getDateISOString,
  getNewNoteID,
  getRandomID,
  isPlatformWeb,
} from "@/lib/utils";
import { getFilename, saveFileToCache } from "@/lib/supabase-storage";

const textPlaceholder = "Start writing ...";

function useNote(id?: string) {
  const isNewNote = !id || id === "new";
  const {
    notes,
    getNote,
    addNote,
    updateNote,
    deleteNote,
    folders,
    tags,
    setTags,
    selectedFolder,
    syncNotes,
    loading,
  } = useNotesStore();
  const [note, setNote] = useState<Note | null>(null);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  useEffect(() => {
    if (!isNewNote) {
      const existingNote = getNote(id);

      if (existingNote) {
        setNote(existingNote);
      }
    } else {
      setNote({
        id: getNewNoteID(),
        title: "",
        folder: undefined,
        content: [
          {
            type: ContentType.TEXT,
            id: getRandomID(),
            updatedAt: getDateISOString(),
            props: { text: "", placeholder: textPlaceholder, focus: false },
          },
        ],
        updatedAt: getDateISOString(),
        createdAt: getDateISOString(),
      });
    }
  }, [isNewNote, id]);

  const handleGoBack = () => {
    if (isPlatformWeb) {
      router.replace("/notes");
    } else {
      router.back();
    }
  };

  const handleSave = async (goBack?: boolean) => {
    if (!note) return;
    const { title, content } = note;

    // Descartar nota vacia
    const isBlank =
      !title.length && content.length === 1 && !content[0].props.text;
    if (isBlank) {
      console.log("Nota vacía descartada");
      goBack && handleGoBack();
      return;
    }

    if (!hasChanges) {
      goBack && handleGoBack();
      return;
    }

    if (!isNewNote) {
      await updateNote(id, { title, content });
    } else {
      await addNote(note);
    }
    goBack && handleGoBack();
  };

  const addNewContentBlock = (
    type: ContentType,
    props: Partial<BlockProps>[]
  ) => {
    if (!note) return;

    let newBlocks: ContentBlock[] = [];
    switch (type) {
      case ContentType.TEXT:
        newBlocks = [
          {
            id: getRandomID(),
            type,
            props: {
              ...props[0],
            },
            updatedAt: getDateISOString(),
          },
        ];
        break;
      case ContentType.CHECKLIST:
        newBlocks = [
          {
            id: getRandomID(),
            type,
            props: {
              items: [
                { id: getRandomID(), text: "", checked: false, focus: false },
              ],
            },
            updatedAt: getDateISOString(),
          },
        ];
        break;
      case ContentType.IMAGE:
        newBlocks = props.map((p) => {
          return {
            id: getRandomID(),
            type,
            props: p,
            updatedAt: getDateISOString(),
          };
        });
        break;
      case ContentType.AUDIO:
        console.log("saving audio...", props[0].uri);
        newBlocks = [
          {
            id: getRandomID(),
            type,
            props: {
              title: props[0].title,
              uri: props[0].uri,
              duration: props[0].duration,
              createdAt: getDateISOString(),
            },
            updatedAt: getDateISOString(),
          },
        ];
        break;
      default:
        break;
    }

    let newContent: ContentBlock[] = [...note.content];

    // Borra último block (anterior al nuevo) si es texto vacío
    if (newContent.length > 0) {
      const lastBlock = newContent[newContent.length - 1];
      if (
        lastBlock.type === ContentType.TEXT &&
        !lastBlock.props.text?.length
      ) {
        newContent.pop();
      }
    }

    if (newBlocks.length > 0) {
      newContent = [...newContent, ...newBlocks];
      // Añade un text seguido del block si el añadido no es tipo text
      if (type !== ContentType.TEXT) {
        newContent.push({
          id: Date.now().toString() + "new",
          type: ContentType.TEXT,
          props: {
            // isExpanded: true,
            focus: false,
            text: "",
            placeholder: "...",
          },
        });
      }
      setNote({ ...note, content: [...newContent] });
    }

    if (!hasChanges) setHasChanges(true);
  };

  const handlePickImage = async () => {
    if (!note) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const promises = result.assets.map((asset) => {
        const filename = getFilename(note.id, asset.uri);
        return saveFileToCache(asset.uri, filename, SUPABASE_BUCKET.IMAGES);
      });

      Promise.all(promises).then((results) => {
        addNewContentBlock(
          ContentType.IMAGE,
          results.map((cachePath) => {
            return {
              text: "Image",
              filename: getFilename(note.id, cachePath!),
              uri: cachePath!,
            };
          })
        );
      });
    }
  };

  const handleSaveRecording = async (props: Partial<BlockProps>) => {
    if (!note || !props.uri) return;

    const filename = getFilename(note.id, props.uri);
    const cachePath = await saveFileToCache(
      props.uri,
      filename,
      SUPABASE_BUCKET.AUDIOS
    );

    if (cachePath)
      addNewContentBlock(ContentType.AUDIO, [{ ...props, uri: cachePath }]);
  };

  const handleUpdateBlock = (updatedBlock: ContentBlock) => {
    if (!note) return;
    const { content } = note;
    const newContent = content.map((block) =>
      block.id === updatedBlock.id
        ? { ...updatedBlock, updatedAt: getDateISOString() }
        : block
    );
    setNote({ ...note, content: [...newContent] });
    if (!hasChanges) setHasChanges(true);
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!note) return;
    const { content } = note;

    const deleteIndex = content.findIndex((b) => b.id === blockId);
    if (deleteIndex === -1) return;

    const isLast = deleteIndex === content.length - 1;
    const currentIsText = content[deleteIndex].type === ContentType.TEXT;
    const prevIsText =
      deleteIndex > 0 && content[deleteIndex - 1].type === ContentType.TEXT;

    // Si es texto y es el único o el último (y no hay un texto antes), no borrar
    if (
      (currentIsText && content.length === 1) ||
      (currentIsText && isLast && !prevIsText)
    ) {
      return;
    }

    let newContent = [...content];

    // Si actual es texto y el anterior es texto, enfocar anterior al borrar
    if (currentIsText && prevIsText) {
      newContent = newContent.map((b, index) => {
        return index === deleteIndex - 1
          ? { ...b, props: { ...b.props, focus: true } }
          : b;
      });
    }

    // Quitar block del contenido
    newContent = content.filter(
      (block) => block.id !== blockId
    ) as ContentBlock[];

    // Si queda vacío, agrega texto default
    if (newContent.length === 0) {
      newContent = [
        {
          id: getRandomID(),
          type: ContentType.TEXT,
          props: { text: "", placeholder: textPlaceholder, focus: true },
        },
      ];
    }

    setNote({ ...note, content: [...newContent] });
    if (!hasChanges) setHasChanges(true);
  };

  const handleUpdateTitle = (newTitle: string) => {
    if (!note) return;
    const { title } = note;

    if (title === newTitle) return;
    setNote({ ...note, title: newTitle });
    if (!hasChanges) setHasChanges(true);
  };

  const handleTitleSubmit = () => {
    if (!note) return;
    const { content } = note;
    // Create text block if content is empty
    const defaultBlock =
      content.length === 1 && content[0].type === ContentType.TEXT
        ? content[0]
        : null;
    if (defaultBlock && defaultBlock.props.text === "") {
      setNote({
        ...note,
        content: [
          { ...defaultBlock, props: { ...defaultBlock.props, focus: true } },
        ],
      });
    }
  };

  return {
    title: note?.title || "",
    content: note?.content || [],
    createdAt: note?.createdAt,
    hasChanges,
    handleGoBack,
    handleSave,
    addNewContentBlock,
    handleUpdateBlock,
    handleUpdateTitle,
    handleTitleSubmit,
    handleDeleteBlock,
    handlePickImage,
    handleSaveRecording,
    notes,
    selectedFolder,
    syncNotes,
    loading,
    updateNote,
    deleteNote,
    folders,
    tags,
  };
}

export default useNote;
