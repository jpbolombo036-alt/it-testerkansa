export interface BlocNoteDTO {
  id: number;
  title?: string;
  content: string;
  applicationId?: number;
  sessionId?: number;
  testId?: number;
  status?: string;
  createdBy?: number;
  createdByUsername?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlocNoteRequest {
  title?: string;
  content: string;
  applicationId?: number;
  sessionId?: number;
  testId?: number;
  status?: string;
}

export const BLOC_NOTE_STATUSES = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'VALIDATED', label: 'Validé' },
  { value: 'REJECTED', label: 'Rejeté' },
  { value: 'ARCHIVED', label: 'Archivé' }
];