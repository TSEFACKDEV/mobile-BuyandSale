import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  getUserFavoritesAction,
  addToFavoritesAction,
  removeFromFavoritesAction,
  toggleFavoriteAction,
  Favorite,
} from './actions';

// ===============================
// LOADING STATES
// ===============================

export enum LoadingType {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

// ===============================
// STATE INTERFACE
// ===============================

export interface FavoriteState {
  data: Favorite[];
  status: LoadingType;
  error: string | null;
  toggleStatus: { [productId: string]: LoadingType };
}

// ===============================
// INITIAL STATE
// ===============================

const initialState: FavoriteState = {
  data: [],
  status: LoadingType.IDLE,
  error: null,
  toggleStatus: {},
};

// ===============================
// SLICE
// ===============================

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState,
  reducers: {
    // Réinitialiser l'erreur
    resetError: (state) => {
      state.error = null;
    },
    // Réinitialiser le statut de toggle pour un produit
    resetToggleStatus: (state, action: PayloadAction<string>) => {
      delete state.toggleStatus[action.payload];
    },
    // Vider tous les favoris (au logout)
    clearFavorites: (state) => {
      state.data = [];
      state.status = LoadingType.IDLE;
      state.error = null;
      state.toggleStatus = {};
    },
  },
  extraReducers: (builder) => {
    // ===============================
    // GET USER FAVORITES
    // ===============================
    builder
      .addCase(getUserFavoritesAction.pending, (state) => {
        state.status = LoadingType.LOADING;
        state.error = null;
      })
      .addCase(
        getUserFavoritesAction.fulfilled,
        (state, action: PayloadAction<Favorite[]>) => {
          state.status = LoadingType.SUCCEEDED;
          state.data = action.payload;
          state.error = null;
        }
      )
      .addCase(getUserFavoritesAction.rejected, (state, action) => {
        state.status = LoadingType.FAILED;
        state.error = action.payload?.message || 'Erreur lors de la récupération des favoris';
      });

    // ===============================
    // ADD TO FAVORITES
    // ===============================
    builder
      .addCase(addToFavoritesAction.pending, (state, action) => {
        const productId = action.meta.arg.productId;
        state.toggleStatus[productId] = LoadingType.LOADING;
        state.error = null;
      })
      .addCase(addToFavoritesAction.fulfilled, (state, action) => {
        const { productId, favorite } = action.payload;
        state.toggleStatus[productId] = LoadingType.SUCCEEDED;
        
        // Ajouter le nouveau favori à la liste
        state.data.push(favorite);
        state.error = null;
      })
      .addCase(addToFavoritesAction.rejected, (state, action) => {
        const productId = action.meta.arg.productId;
        state.toggleStatus[productId] = LoadingType.FAILED;
        state.error = action.payload?.message || 'Erreur lors de l\'ajout aux favoris';
      });

    // ===============================
    // REMOVE FROM FAVORITES
    // ===============================
    builder
      .addCase(removeFromFavoritesAction.pending, (state, action) => {
        const productId = action.meta.arg.productId;
        state.toggleStatus[productId] = LoadingType.LOADING;
        state.error = null;
      })
      .addCase(removeFromFavoritesAction.fulfilled, (state, action) => {
        const { productId } = action.payload;
        state.toggleStatus[productId] = LoadingType.SUCCEEDED;
        
        // Supprimer le favori de la liste
        state.data = state.data.filter((fav) => fav.productId !== productId);
        state.error = null;
      })
      .addCase(removeFromFavoritesAction.rejected, (state, action) => {
        const productId = action.meta.arg.productId;
        state.toggleStatus[productId] = LoadingType.FAILED;
        state.error = action.payload?.message || 'Erreur lors du retrait des favoris';
      });

    // ===============================
    // TOGGLE FAVORITE
    // ===============================
    builder
      .addCase(toggleFavoriteAction.pending, (state, action) => {
        const productId = action.meta.arg.productId;
        state.toggleStatus[productId] = LoadingType.LOADING;
        state.error = null;
      })
      .addCase(toggleFavoriteAction.fulfilled, (state, action) => {
        const { productId, isNowFavorite } = action.payload;
        state.toggleStatus[productId] = LoadingType.SUCCEEDED;
        
        // Si le produit a été retiré, on le supprime de la liste
        // (si ajouté, il a déjà été ajouté par addToFavoritesAction.fulfilled)
        if (!isNowFavorite) {
          state.data = state.data.filter((fav) => fav.productId !== productId);
        }
        
        state.error = null;
      })
      .addCase(toggleFavoriteAction.rejected, (state, action) => {
        const productId = action.meta.arg.productId;
        state.toggleStatus[productId] = LoadingType.FAILED;
        state.error = action.payload?.message || 'Erreur lors du toggle favori';
      });
  },
});

export const { resetError, resetToggleStatus, clearFavorites } = favoriteSlice.actions;

export default favoriteSlice.reducer;
