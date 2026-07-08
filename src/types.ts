export type KnowledgeType =
  | "Requirement"
  | "Checklist"
  | "Lesson Learned"
  | "Reference";

export interface Attachment {
  name: string;
  type: string;
}

export interface Entry {
  id: string;
  ownerId?: number | null;
  title: string;
  interface: string;
  ic: string;
  project: string;
  types: KnowledgeType[];
  tags: string[];
  content: string;
  attachments: Attachment[];
  createdDate: string;
  modifiedDate: string;
  createdBy: string;
}

export type Page =
  | "dashboard"
  | "add"
  | "search"
  | "review"
  | "settings"
  | "detail"
  | "profile";
