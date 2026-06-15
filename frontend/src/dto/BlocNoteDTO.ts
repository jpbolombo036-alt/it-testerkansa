export interface BlocNoteDTO {
  id: number;
  title: string;
  content: string;
  applicationId: number | null;
  sessionId: number | null;
  testId: number | null;
  status: string;
  createdBy: number;
  createdByUsername: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlocNoteRequest {
  title?: string;
  content: string;
  applicationId?: number;
  sessionId?: number;
  testId?: number;
  status?: string;
}

export const STATUS_DRAFT = 'DRAFT';
export const STATUS_PUBLISHED = 'PUBLISHED';
export const STATUS_ARCHIVED = 'ARCHIVED';