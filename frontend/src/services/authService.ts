import api from './api';

export interface AuthData {
  email: string;
  matkhau: string;
  ten?: string;
}

export interface User {
  id?: number;
  ten: string;
  email: string;
  avatar?: string;
  vaitro?: string;
}

interface AuthResponse {
  access_token: string;
  user: User;
}

interface MessageResponse {
  message: string;
}

export const authService = {
  login: (data: AuthData) => api.post<AuthResponse>('/api/auth/login', data),
  register: (data: AuthData) => api.post<AuthResponse>('/api/auth/register', data),
  getMe: () => api.get<User>('/api/auth/me'),
  updateProfile: (data: Partial<User> & { avatar?: string | null }) => api.put<User>('/api/auth/me', data),
  changePassword: (data: { matkhau_cu: string; matkhau_moi: string }) => api.put('/api/auth/me/password', data),

  socialLogin: (provider: 'google' | 'facebook') => api.get<{ url: string }>(`/api/auth/${provider}/url`),
  socialCallback: (provider: 'google' | 'facebook', code: string) => api.post<AuthResponse>(`/api/auth/${provider}/callback`, { code }),

  sendVerificationCode: (email: string) => api.post<MessageResponse>('/api/auth/send-verification-code', { email }),
  verifyCode: (email: string, code: string) => api.post<MessageResponse>('/api/auth/verify-code', { email, code }),
  registerWithEmail: (data: { ten: string; email: string; matkhau: string }) => api.post<AuthResponse>('/api/auth/register', data),
};

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function removeToken(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
  return null;
}

export function setUser(user: User): void {
  localStorage.setItem('user', JSON.stringify(user));
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
