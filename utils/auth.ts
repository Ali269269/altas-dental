// Auth utilities for frontend

export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const getAdmin = (): Admin | null => {
  if (typeof window === 'undefined') return null;
  const admin = localStorage.getItem('admin');
  return admin ? JSON.parse(admin) : null;
};

export const isAdmin = (): boolean => {
  const admin = getAdmin();
  return !!admin && admin.role === 'admin';
};

export const setAuth = (token: string, admin: Admin): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  localStorage.setItem('admin', JSON.stringify(admin));
};

export const clearAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('admin');
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

export const logout = async (): Promise<void> => {
  const token = getToken();
  if (token) {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  clearAuth();
};

export const fetchProtectedRoute = async (url: string) => {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      throw new Error('Session expired');
    }
    throw new Error('Request failed');
  }

  return response.json();
};
