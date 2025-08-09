export enum SUPABASE_BUCKET {
  IMAGES = "images",
  AUDIOS = "audios",
}

export enum ContentType {
  TEXT = "text",
  CHECKLIST = "checklist",
  IMAGE = "image",
  AUDIO = "audio",
}

export interface Note {
  id: string;
  title: string;
  content: ContentBlock[];
  tags?: string[];
  folder?: string;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentBlock {
  id: string;
  type: ContentType;
  props: BlockProps;
  updatedAt?: string;
}

export interface BlockProps {
  text?: string;
  placeholder?: string;
  // isExpanded?: boolean;
  focus?: boolean;
  title?: string;
  items?: ChecklistItem[];
  uri?: string;
  filename?: string;
  duration?: number;
  uploadedAt?: string;
  createdAt?: string;
}

export type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
  focus: boolean;
};

export interface NotesFolder {
  id: string;
  name: string;
}
