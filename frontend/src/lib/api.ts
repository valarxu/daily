const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
  get: async (url: string) => {
    const response = await fetch(`${API_URL}${url}`);
    if (!response.ok) throw new Error('API Error');
    return response.json();
  },
  post: async (url: string, body: any) => {
    const response = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('API Error');
    return response.json();
  },
  put: async (url: string, body: any) => {
    const response = await fetch(`${API_URL}${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('API Error');
    return response.json();
  },
  delete: async (url: string) => {
    const response = await fetch(`${API_URL}${url}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('API Error');
    return response.json();
  },
};