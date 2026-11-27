import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];
let refreshPromise = null;

function clearSession() {
  localStorage.removeItem('ak_token');
  localStorage.removeItem('ak_refresh_token');
  localStorage.removeItem('ak_user');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ak:unauthorized'));
    if (!window.location.pathname.includes('/login')) {
      window.location.assign('/login?reason=session');
    }
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ak_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (
      err.response?.status !== 401 ||
      !original ||
      original._retry ||
      AUTH_PATHS.some((p) => (original.url || '').includes(p))
    ) {
      return Promise.reject(err);
    }
    original._retry = true;

    const refreshToken = localStorage.getItem('ak_refresh_token');
    if (!refreshToken) {
      clearSession();
      return Promise.reject(err);
    }

    try {
      // Une seule requête de refresh pour les appels simultanés
      if (!refreshPromise) {
        refreshPromise = axios.post('/api/auth/refresh', { refreshToken })
          .finally(() => { refreshPromise = null; });
      }
      const { data } = await refreshPromise;
      const nextRefresh = data.refreshToken || refreshToken;

      localStorage.setItem('ak_token', data.token);
      localStorage.setItem('ak_refresh_token', nextRefresh);
      localStorage.setItem('ak_user', JSON.stringify(data.user));
      window.dispatchEvent(new CustomEvent('ak:tokens', {
        detail: { token: data.token, refreshToken: nextRefresh, user: data.user },
      }));

      original.headers.Authorization = `Bearer ${data.token}`;
      return api(original);
    } catch (refreshErr) {
      clearSession();
      return Promise.reject(err);
    }
  }
);

export const authAPI = {
  register: (d) => api.post('/auth/register', d),
  login:    (d) => api.post('/auth/login', d),
  getMe:    ()  => api.get('/auth/me'),
};
export const carAPI = {
  getAll:        (p)    => api.get('/cars', { params: p }),
  getById:       (id)   => api.get(`/cars/${id}`),
  getCategories: ()     => api.get('/cars/categories'),
  create:        (formData) => {
    return api.post('/cars', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },
  update:        (id, formData) => {
    return api.put(`/cars/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },
  toggle:        (id)   => api.patch(`/cars/${id}/toggle`),
  remove:        (id)   => api.delete(`/cars/${id}`),
};
export const cartAPI = {
  get:    ()      => api.get('/cart'),
  count:  ()      => api.get('/cart/count'),
  add:    (d)     => api.post('/cart', d),
  remove: (carId) => api.delete(`/cart/${carId}`),
};
export const orderAPI = {
  create:         (d)    => api.post('/orders', d),
  getMy:          ()     => api.get('/orders/my'),
  getByNumber:    (num)  => api.get(`/orders/${num}`),
  track:          (num)  => api.get(`/orders/track/${num}`),
  getAll:         (p)    => api.get('/orders', { params: p }),
  getAdminDetail: (id)   => api.get(`/orders/${id}`),
  updateStatus:   (id,d) => api.patch(`/orders/${id}`, d),
};
export const simAPI = {
  simulate: (salary) => api.get('/simulation', { params: { salary } }),
};
export const adminAPI = {
  stats:   () => api.get('/admin/stats'),
  clients: () => api.get('/admin/clients'),
  getCars: () => api.get('/admin/cars'),
};
export const userAPI = {
  updateProfile:  (d) => api.put('/user/profile', d),
  changePassword: (d) => api.put('/user/password', d),
};

export default api;
