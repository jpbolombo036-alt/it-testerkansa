import axios from 'axios';
import { BlocNoteDTO, BlocNoteRequest } from '../dto/BlocNoteDTO';

const api = axios.create({
  baseURL: 'https://itaccess-backend-production-5145.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const blocNoteService = {
  getAll: async (): Promise<BlocNoteDTO[]> => {
    const response = await api.get<BlocNoteDTO[]>('/bloc-notes');
    return response.data;
  },

  getById: async (id: number): Promise<BlocNoteDTO> => {
    const response = await api.get<BlocNoteDTO>(`/bloc-notes/${id}`);
    return response.data;
  },

  create: async (data: BlocNoteRequest): Promise<BlocNoteDTO> => {
    const response = await api.post<BlocNoteDTO>('/bloc-notes', data);
    return response.data;
  },

  update: async (id: number, data: BlocNoteRequest): Promise<BlocNoteDTO> => {
    const response = await api.put<BlocNoteDTO>(`/bloc-notes/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/bloc-notes/${id}`);
  },
};

export default blocNoteService;