import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import { useNotesStore } from "@/store/useNotesStore";
import {
  BlockProps,
  ContentBlock,
  ContentType,
  DELETED_FOLDER_ID,
  PROTECTED_FOLDER_ID,
} from "@/types";
import { getDateISOString, getRandomID, isPlatformWeb } from "@/lib/utils";

const textPlaceholder = "Start writing ...";

function useNote(id?: string) {
  const isNewNote = !id || id === "new";
  const {
    notes,
    getNote,
    addNote,
    updateNote,
    folders,
    setFolders,
    tags,
    setTags,
    setNotes,
    selectedFolder,
    syncNotes,
    loading,
  } = useNotesStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [createdAt, setCreatedAt] = useState("");

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
        addNewContentBlock(ContentType.TEXT, [
          {
            text: "",
            placeholder: textPlaceholder,
            // isExpanded: true,
            focus: false,
          },
        ]);
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

  const handleSave = async (goBack?: boolean) => {
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
      await updateNote(id as string, { title, content });
    } else {
      await addNote({ title, content });
    }
    goBack && handleGoBack();
  };

  const addNewContentBlock = (
    type: ContentType,
    props: Partial<BlockProps>[]
  ) => {
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

    // Shrink the previous last block if it was expanded (or any other expanded block)
    // const updatedContent = content.map((block) =>
    //   block.props.isExpanded
    //     ? { ...block, props: { ...block.props, isExpanded: false } }
    //     : block
    // );

    let newContent: ContentBlock[] = [...content];

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
      setContent([...newContent]);
    }

    if (!hasChanges) setHasChanges(true);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      addNewContentBlock(
        ContentType.IMAGE,
        result.assets.map((asset) => {
          return {
            text: "Image",
            uri: asset.uri,
          };
        })
      );
    }
  };

  const handleUpdateBlock = (updatedBlock: ContentBlock) => {
    const newContent = content.map((block) =>
      block.id === updatedBlock.id
        ? { ...updatedBlock, updatedAt: getDateISOString() }
        : block
    );
    setContent(newContent);
    if (!hasChanges) setHasChanges(true);
  };

  const handleDeleteBlock = (blockId: string) => {
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

    setContent(newContent);
    if (!hasChanges) setHasChanges(true);
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

  // Folder & tags handling ...
  const selectFolder = (selectedFolder?: string) => {
    useNotesStore.setState({ selectedFolder });
  };

  const getNoteByFolder = (folderId?: string) => {
    // by default returns all except deleted, protected and notes without folder defined or existent
    console.log("folderId: ", folderId);
    return notes.filter((n) =>
      folderId
        ? n.folder === folderId
        : (n.folder !== DELETED_FOLDER_ID &&
            n.folder !== PROTECTED_FOLDER_ID) ||
          !n.folder
    );
  };

  const addFolder = async (name: string) => {
    const updatedFolders = [...folders, { id: getRandomID(), name }];
    setFolders(updatedFolders);
  };

  const updateFolder = async (id: string, propName: string, value: any) => {};

  const deleteFolder = async (id: string) => {
    if (id === DELETED_FOLDER_ID || id === PROTECTED_FOLDER_ID) return;

    const updatedFolders = [...folders.filter((f) => f.id !== id)];
    setNotes([
      ...notes.map((n) => ({
        ...n,
        folder: n.folder === id ? undefined : n.folder,
      })),
    ]);

    setFolders(updatedFolders);
  };

  const moveToFolder = async (noteId: string, folder: string | undefined) => {
    // undefined is meant for notes without folder
    await useNotesStore.getState().setNotes([
      ...useNotesStore.getState().notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              folder,
              updatedAt:
                folder === DELETED_FOLDER_ID ? getDateISOString() : n.updatedAt,
            }
          : n
      ),
    ]);
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
    notes,
    getNoteByFolder,
    moveToFolder,
    selectFolder,
    addFolder,
    updateFolder,
    deleteFolder,
    selectedFolder,
    syncNotes,
    loading,
    updateNote,
    folders,
    tags,
  };
}

export default useNote;
