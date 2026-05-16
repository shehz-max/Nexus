const API_BASE = '/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
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

export const authApi = {
  login: (email: string, password: string) =>
    fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
  me: () => fetchAPI('/auth/me'),
};

export const usersApi = {
  me: () => fetchAPI('/users/me'),
  update: (data: { name?: string }) => fetchAPI('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
};

export const integrationsApi = {
  list: () => fetchAPI('/integrations'),
};

export const connectionsApi = {
  list: () => fetchAPI('/connections'),
  create: (data: { integrationId: string; integrationSlug: string; name: string }) =>
    fetchAPI('/connections', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`/connections/${id}`, { method: 'DELETE' }),
};

export const workflowsApi = {
  list: () => fetchAPI('/workflows'),
  get: (id: string) => fetchAPI(`/workflows/${id}`),
  create: (data: any) => fetchAPI('/workflows', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchAPI(`/workflows/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => fetchAPI(`/workflows/${id}`, { method: 'DELETE' }),
  enable: (id: string) => fetchAPI(`/workflows/${id}/enable`, { method: 'POST' }),
  disable: (id: string) => fetchAPI(`/workflows/${id}/disable`, { method: 'POST' }),
  runs: (id: string) => fetchAPI(`/workflows/${id}/runs`),
};

export const runsApi = {
  list: (params?: { workflowId?: string; status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.workflowId) searchParams.set('workflowId', params.workflowId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return fetchAPI(`/runs${query ? `?${query}` : ''}`);
  },
  retry: (id: string) => fetchAPI(`/runs/${id}/retry`, { method: 'POST' }),
  stats: () => fetchAPI('/runs/stats'),
};