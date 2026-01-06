import { createAsyncThunk } from '@reduxjs/toolkit';
import API_CONFIG from '../../config/api.config';
import fetchWithAuth from '../../utils/fetchWithAuth';
import type { Product } from '../product/actions';

// ===============================
// TYPES ET INTERFACES
// ===============================

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  product: Product | null;
  createdAt: string;
  updatedAt: string;
}

interface ThunkApi {
  rejectValue: {
    message: string;
  };
}

// ===============================
// ACTIONS AUTHENTIFIÉES
// ===============================

/**
 * Récupère tous les favoris de l'utilisateur connecté
 * Backend: GET /favorite
 */
export const getUserFavoritesAction = createAsyncThunk<
  Favorite[],
  void,
  ThunkApi
>(
  'favorite/getUserFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/favorite`,
        {
          method: 'GET',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Erreur lors de la récupération des favoris');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'Erreur lors de la récupération des favoris',
      });
    }
  }
);

/**
 * Ajoute un produit aux favoris
 * Backend: POST /favorite/add
 */
export const addToFavoritesAction = createAsyncThunk<
  { favorite: Favorite; productId: string },
  { productId: string },
  ThunkApi
>(
  'favorite/addToFavorites',
  async ({ productId }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/favorite/add`,
        {
          method: 'POST',
          body: JSON.stringify({ productId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Erreur lors de l\'ajout aux favoris');
      }

      return { favorite: data.data, productId };
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'Erreur lors de l\'ajout aux favoris',
      });
    }
  }
);

/**
 * Retire un produit des favoris
 * Backend: DELETE /favorite/remove
 */
export const removeFromFavoritesAction = createAsyncThunk<
  { success: boolean; productId: string },
  { productId: string },
  ThunkApi
>(
  'favorite/removeFromFavorites',
  async ({ productId }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/favorite/remove`,
        {
          method: 'DELETE',
          body: JSON.stringify({ productId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Erreur lors du retrait des favoris');
      }

      return { success: true, productId };
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'Erreur lors du retrait des favoris',
      });
    }
  }
);

/**
 * Toggle favori (ajoute si absent, retire si présent)
 * Action composite qui utilise add ou remove selon le cas
 */
export const toggleFavoriteAction = createAsyncThunk<
  { productId: string; isNowFavorite: boolean },
  { productId: string; isCurrentlyFavorite: boolean },
  ThunkApi
>(
  'favorite/toggleFavorite',
  async ({ productId, isCurrentlyFavorite }, { dispatch, rejectWithValue }) => {
    try {
      if (isCurrentlyFavorite) {
        await dispatch(removeFromFavoritesAction({ productId })).unwrap();
        return { productId, isNowFavorite: false };
      } else {
        await dispatch(addToFavoritesAction({ productId })).unwrap();
        return { productId, isNowFavorite: true };
      }
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'Erreur lors du toggle favori',
      });
    }
  }
);
