import { create } from 'zustand';
import { cartAPI } from '../services/api';

// ─── Language Store ────────────────────────────────────────────────────────
export const useLangStore = create((set, get) => ({
  lang: localStorage.getItem('ak_lang') || 'fr',
  setLang: (lang) => {
    localStorage.setItem('ak_lang', lang);
    // RTL support for Arabic
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    set({ lang });
  },
}));

// ─── Auth Store ────────────────────────────────────────────────────────────
export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('ak_user') || 'null'),
  token: localStorage.getItem('ak_token') || null,
  isAuthenticated: !!localStorage.getItem('ak_token'),

  login: (user, token) => {
    localStorage.setItem('ak_token', token);
    localStorage.setItem('ak_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('ak_token');
    localStorage.removeItem('ak_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (updates) => {
    const updated = { ...get().user, ...updates };
    localStorage.setItem('ak_user', JSON.stringify(updated));
    set({ user: updated });
  },
  isAdmin: () => get().user?.role === 'ADMIN',
}));

// ─── Cart Store ────────────────────────────────────────────────────────────
export const useCartStore = create((set, get) => ({
  cartItems: [],
  cartCount: 0,
  total: 0,
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      const { data } = await cartAPI.get();
      set({ cartItems: data.cartItems, total: data.total, cartCount: data.count, loading: false });
    } catch { set({ loading: false }); }
  },
  fetchCount: async () => {
    try { const { data } = await cartAPI.count(); set({ cartCount: data.count }); } catch {}
  },
  addItem: async (carId, paymentType = 'full') => {
    const { data } = await cartAPI.add({ carId, paymentType });
    set({ cartCount: data.cartCount });
    return data;
  },
  removeItem: async (carId) => {
    const { data } = await cartAPI.remove(carId);
    const newItems = get().cartItems.filter(i => i.carId !== carId);
    const newTotal = newItems.reduce((s, i) => s + i.car.price * i.quantity, 0);
    set({ cartItems: newItems, total: newTotal, cartCount: data.cartCount });
  },
  clear: () => set({ cartItems: [], total: 0, cartCount: 0 }),
}));

// ─── Toast Store ───────────────────────────────────────────────────────────
let toastId = 0;
export const useToastStore = create((set, get) => ({
  toasts: [],
  addToast: (message, type = 'success', duration = 3800) => {
    const id = ++toastId;
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => set({ toasts: get().toasts.filter(t => t.id !== id) }), duration);
    return id;
  },
  removeToast: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) }),
}));
