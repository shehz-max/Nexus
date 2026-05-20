const API_BASE = '/api';

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

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned non-JSON response: ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(data.error?.message || `Request failed with status ${response.status}`);
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

export const authApi = {
  login: async (email: string, password: string) => {
    const data = await fetchAPI('/auth?action=login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (data.data?.token) setToken(data.data.token);
    return data;
  },
  logout: async () => {
    await fetchAPI('/auth?action=logout', { method: 'POST' });
    if (typeof window !== 'undefined') localStorage.removeItem('nexus_token');
  },
  me: () => fetchAPI('/auth?action=me', { method: 'POST' }),
  register: async (email: string, password: string, name?: string) => {
    const data = await fetchAPI('/auth?action=register', { method: 'POST', body: JSON.stringify({ email, password, name }) });
    if (data.data?.token) setToken(data.data.token);
    return data;
  },
  google: () => { window.location.href = '/api/auth?action=google'; },
  github: () => { window.location.href = '/api/auth?action=github'; },
  seed: () => fetchAPI('/auth?action=seed', { method: 'POST' }),
};

export const integrationsApi = {
  list: () => fetchAPI('/index?resource=integrations'),
};

export const templatesApi = {
  list: (params?: { category?: string; search?: string }) => {
    const searchParams = new URLSearchParams({ resource: 'templates' });
    if (params?.category && params.category !== 'all') searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    return fetchAPI(`/index?${searchParams.toString()}`);
  },
};

export const connectionsApi = {
  list: () => authFetchAPI('/index?resource=connections'),
  create: (data: { integrationId: string }) => authFetchAPI('/index?resource=connections', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => authFetchAPI('/index?resource=connections', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

export const workflowsApi = {
  list: () => authFetchAPI('/index?resource=workflows'),
  get: (id: string) => authFetchAPI('/index?resource=workflows_get&id=' + id),
  create: (data: any) => authFetchAPI('/index?resource=workflows', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => authFetchAPI('/index?resource=workflows_update', { method: 'POST', body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) => authFetchAPI('/index?resource=workflows_delete', { method: 'POST', body: JSON.stringify({ id }) }),
  enable: (id: string) => authFetchAPI('/index?resource=workflows_update', { method: 'POST', body: JSON.stringify({ id, status: 'active', isActive: true }) }),
  disable: (id: string) => authFetchAPI('/index?resource=workflows_update', { method: 'POST', body: JSON.stringify({ id, status: 'draft', isActive: false }) }),
};

export const runsApi = {
  list: (params?: { workflowId?: string; status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams({ resource: 'runs' });
    if (params?.workflowId) searchParams.set('workflowId', params.workflowId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    return authFetchAPI('/index?' + searchParams.toString());
  },
  get: (id: string) => authFetchAPI('/index?resource=runs_get&id=' + id),
};

export const triggerApi = {
  test: (data: { integrationId: string; triggerId: string; config?: Record<string, any> }) =>
    authFetchAPI('/index?resource=trigger_test', { method: 'POST', body: JSON.stringify(data) }),
};

export const actionApi = {
  test: (data: { integrationId: string; actionId: string; config?: Record<string, any>; sampleData?: any }) =>
    authFetchAPI('/index?resource=action_test', { method: 'POST', body: JSON.stringify(data) }),
};

export const workflowApi = {
  activate: (id: string) => authFetchAPI('/index?resource=workflow_activate', { method: 'POST', body: JSON.stringify({ id }) }),
  triggerManual: (id: string, triggerData?: any) => authFetchAPI('/index?resource=workflow_trigger_manual', { method: 'POST', body: JSON.stringify({ id, triggerData }) }),
  duplicate: (id: string) => authFetchAPI('/index?resource=workflow_duplicate', { method: 'POST', body: JSON.stringify({ id }) }),
};