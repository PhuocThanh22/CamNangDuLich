import api from './api';

export interface AdminStats {
  total_users: number;
  total_places: number;
  pending_places: number;
  total_reviews: number;
}

export interface AdminPlace {
  id: number;
  ten: string;
  phanloai: string;
  diachi?: string;
  mota?: string;
  hinh?: string;
  daduyet: boolean;
  nguoidung_id?: number;
  created_at?: string;
  trangthai?: string;
}

export const adminService = {
  getStats: () => api.get<AdminStats>('/api/admin/stats'),
  getPlaces: (pending?: boolean) => api.get<AdminPlace[]>('/api/admin/places', { params: { pending } }),
  approvePlace: (id: number) => api.put(`/api/admin/places/${id}/approve`),
  rejectPlace: (id: number) => api.delete(`/api/admin/places/${id}`),
};
