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
      console.log('=== Cart Debug: Fetching cart ===');
      const { data } = await cartAPI.get();
      console.log('Cart API response:', data);
      set({ cartItems: data.cartItems, total: data.total, cartCount: data.count, loading: false });
      console.log('Cart state updated:', { cartItems: data.cartItems, total: data.total, count: data.count });
    } catch (error) { 
      console.error('Cart fetch error:', error);
      set({ loading: false }); 
    }
  },
  fetchCount: async () => {
    try { const { data } = await cartAPI.count(); set({ cartCount: data.count }); } catch {}
  },
  addItem: async (carId, paymentType = 'full') => {
    try {
      console.log('=== Cart Debug: Adding item to cart ===');
      console.log('Car ID:', carId, 'Payment Type:', paymentType);
      
      const { data } = await cartAPI.add({ carId, paymentType });
      console.log('Cart API add response:', data);
      
      // Update cartItems with the new item
      const currentItems = get().cartItems || [];
      const updatedItems = [...currentItems, data.cartItem];
      set({ 
        cartItems: updatedItems, 
        cartCount: data.cartCount,
        total: updatedItems.reduce((sum, item) => sum + item.car.price * item.quantity, 0)
      });
      
      console.log('Cart state after add:', { cartItems: updatedItems, cartCount: data.cartCount });
      console.log('Current store state:', get());
      return data;
    } catch (error) {
      console.error('Cart add error:', error);
      throw error;
    }
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
