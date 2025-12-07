const base = '/api/tasks';

export const taskService = {
  list: async (q?: any) => {
    const params = new URLSearchParams(q || {}).toString();
    const res = await fetch(base + (params ? `?${params}` : ''));
    return res.json();
  },
  getById: async (id: number) => {
    const res = await fetch(`${base}/${id}`);
    return res.json();
  },
  create: async (payload: any) => {
    const res = await fetch(base, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
    return res.json();
  },
  update: async (id: number, payload: any) => {
    const res = await fetch(`${base}/${id}`, { method: 'PATCH', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
    return res.json();
  },
  remove: async (id: number) => {
    const res = await fetch(`${base}/${id}`, { method: 'DELETE' });
    return res.json();
  }
};
