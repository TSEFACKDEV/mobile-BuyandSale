import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@recently_viewed';
const MAX_ITEMS = 10;

// Sous-ensemble minimal du produit stocké localement (évite de trop remplir AsyncStorage)
interface RecentProduct {
  id: string;
  name: string;
  price: number;
  images?: string[];
  slug?: string;
  city?: { name: string };
  viewCount?: number;
  user?: any;
  forfaits?: any[];
}

export const useRecentlyViewed = () => {
  const [products, setProducts] = useState<RecentProduct[]>([]);

  const load = useCallback(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return;
        const valid = parsed.filter(
          (item) => item && typeof item === 'object' && typeof item.id === 'string' && typeof item.price === 'number'
        );
        if (valid.length !== parsed.length) {
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(valid)).catch(() => {});
        }
        setProducts(valid);
      } catch {}
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addProduct = useCallback((product: RecentProduct) => {
    setProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const next = [product, ...filtered].slice(0, MAX_ITEMS);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return { products, addProduct, reload: load };
};
