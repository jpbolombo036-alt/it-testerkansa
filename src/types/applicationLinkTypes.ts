export type ApplicationLink = {
  id?: number;
  applicationId: number;
  nom: string;
  url: string;
  type?: string;
  description?: string;
  dateCreation?: string;
  createdBy?: number;
  createdByUsername?: string;
  application?: {
    id?: number;
    nom?: string;
  };
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
};

export type ApplicationLinkForm = {
  applicationId: number;
  nom: string;
  url: string;
  type: string;
  description: string;
};

export type ApplicationLinkError = {
  field: string;
  message: string;
};