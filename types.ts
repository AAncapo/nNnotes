/* eslint-disable prettier/prettier */
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
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface ContentBlock {
  id: string;
  type: ContentType;
  props: BlockProps;
}

export interface BlockProps {
  text?: string;
  placeholder?: string;
  // isExpanded?: boolean;
  focus?: boolean;
  title?: string;
  items?: ChecklistItem[];
  uri?: string;
  duration?: number;
  createdAt?: string;
}

export type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
};
