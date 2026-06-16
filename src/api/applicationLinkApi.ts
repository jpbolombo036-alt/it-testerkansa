import api from './axios';
import { ApplicationLink, PageResponse, ApplicationLinkForm } from '../types/applicationLinkTypes';

interface FetchLinksParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export async function fetchApplicationLinks(params: FetchLinksParams = {}) {
  const response = await api.get<PageResponse<ApplicationLink>>('/application-links', { params });
  return response.data;
}

export async function fetchApplicationLinksByApplication(applicationId: number) {
  const response = await api.get<ApplicationLink[]>(`/application-links/applications/${applicationId}`);
  return response.data;
}

export async function fetchApplicationLinkById(id: number) {
  const response = await api.get<ApplicationLink>(`/application-links/${id}`);
  return response.data;
}

export async function createApplicationLink(data: ApplicationLinkForm) {
  const response = await api.post<ApplicationLink>('/application-links', data);
  return response.data;
}

export async function updateApplicationLink(id: number, data: ApplicationLinkForm) {
  const response = await api.put<ApplicationLink>(`/application-links/${id}`, data);
  return response.data;
}

export async function deleteApplicationLink(id: number) {
  await api.delete(`/application-links/${id}`);
}