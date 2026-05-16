const API_BASE = (typeof window !== 'undefined' ? window.location.origin : '');

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}/api${endpoint}`;
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Something went wrong');
  }

  return data;
}

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('nexus_token');
  }
  return null;
}

function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nexus_token', token);
  }
}

export const authApi = {
  login: async (email: string, password: string) => {
    const data = await fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (data.data?.token) {
      setToken(data.data.token);
    }
    return data;
  },
  logout: async () => {
    await fetchAPI('/auth/logout', { method: 'POST' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nexus_token');
    }
  },
  me: () => fetchAPI('/auth/me'),
  register: async (email: string, password: string, name?: string) => {
    const data = await fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) });
    if (data.data?.token) {
      setToken(data.data.token);
    }
    return data;
  },
};

function authFetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetchAPI(endpoint, { ...options, headers });
}

export const usersApi = {
  me: () => authFetchAPI('/users/me'),
  update: (data: { name?: string }) => authFetchAPI('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
};

export const integrationsApi = {
  list: () => fetchAPI('/integrations'),
};

export const connectionsApi = {
  list: () => authFetchAPI('/connections'),
  create: (data: { integrationId: string; integrationSlug?: string; name?: string }) =>
    authFetchAPI('/connections', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => authFetchAPI(`/connections/${id}`, { method: 'DELETE' }),
};

export const workflowsApi = {
  list: () => authFetchAPI('/workflows'),
  get: (id: string) => authFetchAPI(`/workflows/${id}`),
  create: (data: any) => authFetchAPI('/workflows', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => authFetchAPI(`/workflows/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => authFetchAPI(`/workflows/${id}`, { method: 'DELETE' }),
  enable: (id: string) => authFetchAPI(`/workflows/${id}/enable`, { method: 'POST' }),
  disable: (id: string) => authFetchAPI(`/workflows/${id}/disable`, { method: 'POST' }),
  runs: (id: string) => authFetchAPI(`/workflows/${id}/runs`),
};

export const runsApi = {
  list: (params?: { workflowId?: string; status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.workflowId) searchParams.set('workflowId', params.workflowId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return authFetchAPI(`/runs${query ? `?${query}` : ''}`);
  },
  retry: (id: string) => authFetchAPI(`/runs/${id}/retry`, { method: 'POST' }),
  stats: () => authFetchAPI('/runs/stats'),
};