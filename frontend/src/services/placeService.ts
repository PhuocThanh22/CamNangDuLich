import api from './api';

interface PlaceQueryParams {
  featured?: boolean;
  limit?: number;
  sort_by?: string;
}

interface PlaceData {
  ten: string;
  phanloai?: string;
  gia?: string | null;
  diachi?: string | null;
  mota?: string | null;
  giohoatdong?: string | null;
  giomocua?: string | null;
  hinh?: string | null;
  vido?: number | null;
  kinhdo?: number | null;
}

export const placeService = {
  getAll: (params?: PlaceQueryParams) => api.get('/api/places', { params }),
  getById: (id: number) => api.get(`/api/places/${id}`),
  getCategories: () => api.get('/api/places/categories'),
  getNearby: (params?: Record<string, unknown>) => api.get('/api/places/nearby', { params }),
  create: (data: PlaceData) => api.post('/api/places', data),
  update: (id: number, data: PlaceData) => api.put(`/api/places/${id}`, data),
  delete: (id: number) => api.delete(`/api/places/${id}`),
  getMyPlaces: () => api.get('/api/places/cua-toi'),
  getFavorites: () => api.get('/api/places/yeu-thich'),
  toggleFavorite: (id: number) => api.post(`/api/places/${id}/yeu-thich`),
  getReviews: (placeId: number) => api.get(`/api/reviews/place/${placeId}`),
  createReview: (data: { diadiem_id: number; diemdanhgia: number; noidung?: string }) => api.post('/api/reviews/', data),
  deleteReview: (id: number) => api.delete(`/api/reviews/${id}`),
  getMenuItems: (placeId: number) => api.get(`/api/places/${placeId}/menu`),
  createMenuItem: (placeId: number, data: { ten: string; gia?: string; mota?: string; hinh?: string }) => api.post(`/api/places/${placeId}/menu`, data),
  deleteMenuItem: (placeId: number, itemId: number) => api.delete(`/api/places/${placeId}/menu/${itemId}`),
  getPlaceImages: (placeId: number) => api.get(`/api/places/${placeId}/images`),
};
