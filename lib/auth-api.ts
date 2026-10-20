export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthRequest = {
  name?: string;
  email: string;
  password: string;
};

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8080').replace(/\/+$/, '');

async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/auth${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Cannot reach CineBook. Check that the backend is running and try again.');
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
      ? body.message
      : response.status === 401 ? 'Invalid email or password.' : 'The request could not be completed.';
    const error = new Error(message) as Error & { status: number };
    error.status = response.status;
    throw error;
  }
  return body as T;
}

export function registerUser(data: AuthRequest): Promise<AuthUser> {
  return authRequest('/register', { method: 'POST', body: JSON.stringify(data) });
}

export function loginUser(data: AuthRequest): Promise<AuthUser> {
  return authRequest('/login', { method: 'POST', body: JSON.stringify(data) });
}

export function getCurrentUser(): Promise<AuthUser> {
  return authRequest('/me');
}

export function logoutUser(): Promise<{ message: string }> {
  return authRequest('/logout', { method: 'POST' });
}
