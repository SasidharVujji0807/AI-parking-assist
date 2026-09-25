import { supabase } from '../lib/supabase';
import type { ApiResponse } from '../types';

const API_BASE = '/api';

// ── Generic fetch wrapper ──────────────────────────────────────────────────

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
      },
    };
  }
}

// ── Parking API ────────────────────────────────────────────────────────────

export const parkingApi = {
  search: (params: Record<string, string | number | boolean>) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '' && v !== false)
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return fetchWithAuth<{ parking: unknown[]; total: number }>(`/parking?${query}`);
  },

  getById: (id: string) =>
    fetchWithAuth<unknown>(`/parking/${id}`),

  create: (data: unknown) =>
    fetchWithAuth<unknown>('/parking', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: unknown) =>
    fetchWithAuth<unknown>(`/parking/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    fetchWithAuth<unknown>(`/parking/${id}`, { method: 'DELETE' }),

  getReviews: (id: string) =>
    fetchWithAuth<unknown[]>(`/parking/${id}/reviews`),

  createReview: (id: string, data: unknown) =>
    fetchWithAuth<unknown>(`/parking/${id}/reviews`, { method: 'POST', body: JSON.stringify(data) }),

  createReport: (id: string, data: unknown) =>
    fetchWithAuth<unknown>(`/parking/${id}/reports`, { method: 'POST', body: JSON.stringify(data) }),
};

// ── Favorites API ──────────────────────────────────────────────────────────

export const favoritesApi = {
  getAll: () => fetchWithAuth<unknown[]>('/favorites'),
  add: (parkingId: string) => fetchWithAuth<unknown>(`/favorites/${parkingId}`, { method: 'POST' }),
  remove: (parkingId: string) => fetchWithAuth<unknown>(`/favorites/${parkingId}`, { method: 'DELETE' }),
};

// ── Reviews API ────────────────────────────────────────────────────────────

export const reviewsApi = {
  update: (id: string, data: unknown) =>
    fetchWithAuth<unknown>(`/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchWithAuth<unknown>(`/reviews/${id}`, { method: 'DELETE' }),
};

// ── History API ────────────────────────────────────────────────────────────

export const historyApi = {
  getAll: () => fetchWithAuth<unknown[]>('/history'),
  save: (data: unknown) => fetchWithAuth<unknown>('/history', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => fetchWithAuth<unknown>(`/history/${id}`, { method: 'DELETE' }),
};

// ── AI API ─────────────────────────────────────────────────────────────────

export const aiApi = {
  parseRequest: (message: string) =>
    fetchWithAuth<unknown>('/ai/parse-request', { method: 'POST', body: JSON.stringify({ message }) }),

  recommend: (data: { message: string; userLat?: number; userLng?: number; city?: string }) =>
    fetchWithAuth<unknown>('/ai/recommend', { method: 'POST', body: JSON.stringify(data) }),

  chat: (data: { message: string; conversationId?: string; userLat?: number; userLng?: number }) =>
    fetchWithAuth<unknown>('/ai/chat', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Auth API ───────────────────────────────────────────────────────────────

export const authApi = {
  getMe: () => fetchWithAuth<unknown>('/auth/me'),
  updateProfile: (data: unknown) =>
    fetchWithAuth<unknown>('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
};

// ── Operator API ───────────────────────────────────────────────────────────

export const operatorApi = {
  getParking: () => fetchWithAuth<unknown[]>('/operator/parking'),
  createParking: (data: unknown) =>
    fetchWithAuth<unknown>('/operator/parking', { method: 'POST', body: JSON.stringify(data) }),
  updateParking: (id: string, data: unknown) =>
    fetchWithAuth<unknown>(`/operator/parking/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteParking: (id: string) =>
    fetchWithAuth<unknown>(`/operator/parking/${id}`, { method: 'DELETE' }),
};

// ── Admin API ──────────────────────────────────────────────────────────────

export const adminApi = {
  getStats: () => fetchWithAuth<unknown>('/admin/stats'),
  getUsers: () => fetchWithAuth<unknown[]>('/admin/users'),
  getParking: () => fetchWithAuth<unknown[]>('/admin/parking'),
  getReports: () => fetchWithAuth<unknown[]>('/admin/reports'),
  updateReport: (id: string, data: unknown) =>
    fetchWithAuth<unknown>(`/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getReviews: () => fetchWithAuth<unknown[]>('/admin/reviews'),
  moderateReview: (id: string, data: unknown) =>
    fetchWithAuth<unknown>(`/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};
