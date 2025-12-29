import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import {
  getSellerReviewsAction,
  getReviewByIdAction,
  getMyReviewsAction,
  createReviewAction,
  updateReviewAction,
  deleteReviewAction,
  Review,
  SellerReviewsResponse,
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

export interface ReviewState {
  myReviews: Review[];
  sellerReviews: SellerReviewsResponse | null;
  selectedReview: Review | null;
  error: string | null;
  createStatus: LoadingType;
  updateStatus: LoadingType;
  deleteStatus: LoadingType;
  sellerStatus: LoadingType;
  myReviewsStatus: LoadingType;
  selectedReviewStatus: LoadingType;
}

// ===============================
// INITIAL STATE
// ===============================

const initialState: ReviewState = {
  myReviews: [],
  sellerReviews: null,
  selectedReview: null,
  error: null,
  createStatus: LoadingType.IDLE,
  updateStatus: LoadingType.IDLE,
  deleteStatus: LoadingType.IDLE,
  sellerStatus: LoadingType.IDLE,
  myReviewsStatus: LoadingType.IDLE,
  selectedReviewStatus: LoadingType.IDLE,
};

// ===============================
// SLICE
// ===============================

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    // Réinitialiser l'état des erreurs
    clearReviewError: (state) => {
      state.error = null;
    },
    // Réinitialiser l'état de création
    resetCreateStatus: (state) => {
      state.createStatus = LoadingType.IDLE;
    },
    // Réinitialiser l'état de mise à jour
    resetUpdateStatus: (state) => {
      state.updateStatus = LoadingType.IDLE;
    },
    // Réinitialiser l'état de suppression
    resetDeleteStatus: (state) => {
      state.deleteStatus = LoadingType.IDLE;
    },
    // Réinitialiser les reviews d'un vendeur
    clearSellerReviews: (state) => {
      state.sellerReviews = null;
      state.sellerStatus = LoadingType.IDLE;
    },
    // Réinitialiser la review sélectionnée
    clearSelectedReview: (state) => {
      state.selectedReview = null;
      state.selectedReviewStatus = LoadingType.IDLE;
    },
  },
  extraReducers: (builder) => {
    // ===============================
    // GET SELLER REVIEWS
    // ===============================
    builder
      .addCase(getSellerReviewsAction.pending, (state) => {
        state.sellerStatus = LoadingType.LOADING;
        state.error = null;
      })
      .addCase(
        getSellerReviewsAction.fulfilled,
        (state, action: PayloadAction<SellerReviewsResponse>) => {
          state.sellerStatus = LoadingType.SUCCEEDED;
          state.sellerReviews = action.payload;
          state.error = null;
        }
      )
      .addCase(getSellerReviewsAction.rejected, (state, action) => {
        state.sellerStatus = LoadingType.FAILED;
        state.error = action.payload?.message || 'Failed to fetch seller reviews';
      });

    // ===============================
    // GET REVIEW BY ID
    // ===============================
    builder
      .addCase(getReviewByIdAction.pending, (state) => {
        state.selectedReviewStatus = LoadingType.LOADING;
        state.error = null;
      })
      .addCase(
        getReviewByIdAction.fulfilled,
        (state, action: PayloadAction<Review>) => {
          state.selectedReviewStatus = LoadingType.SUCCEEDED;
          state.selectedReview = action.payload;
          state.error = null;
        }
      )
      .addCase(getReviewByIdAction.rejected, (state, action) => {
        state.selectedReviewStatus = LoadingType.FAILED;
        state.error = action.payload?.message || 'Failed to fetch review';
      });

    // ===============================
    // GET MY REVIEWS
    // ===============================
    builder
      .addCase(getMyReviewsAction.pending, (state) => {
        state.myReviewsStatus = LoadingType.LOADING;
        state.error = null;
      })
      .addCase(
        getMyReviewsAction.fulfilled,
        (state, action: PayloadAction<{ reviews: Review[] }>) => {
          state.myReviewsStatus = LoadingType.SUCCEEDED;
          state.myReviews = action.payload.reviews;
          state.error = null;
        }
      )
      .addCase(getMyReviewsAction.rejected, (state, action) => {
        state.myReviewsStatus = LoadingType.FAILED;
        state.error = action.payload?.message || 'Failed to fetch your reviews';
      });

    // ===============================
    // CREATE REVIEW
    // ===============================
    builder
      .addCase(createReviewAction.pending, (state) => {
        state.createStatus = LoadingType.LOADING;
        state.error = null;
      })
      .addCase(
        createReviewAction.fulfilled,
        (state, action: PayloadAction<Review>) => {
          state.createStatus = LoadingType.SUCCEEDED;
          state.myReviews.unshift(action.payload);
          state.error = null;
        }
      )
      .addCase(createReviewAction.rejected, (state, action) => {
        state.createStatus = LoadingType.FAILED;
        state.error = action.payload?.message || 'Failed to create review';
      });

    // ===============================
    // UPDATE REVIEW
    // ===============================
    builder
      .addCase(updateReviewAction.pending, (state) => {
        state.updateStatus = LoadingType.LOADING;
        state.error = null;
      })
      .addCase(
        updateReviewAction.fulfilled,
        (state, action: PayloadAction<Review>) => {
          state.updateStatus = LoadingType.SUCCEEDED;
          
          // Mettre à jour dans myReviews
          const index = state.myReviews.findIndex(r => r.id === action.payload.id);
          if (index !== -1) {
            state.myReviews[index] = action.payload;
          }
          
          // Mettre à jour selectedReview si c'est la même
          if (state.selectedReview?.id === action.payload.id) {
            state.selectedReview = action.payload;
          }
          
          state.error = null;
        }
      )
      .addCase(updateReviewAction.rejected, (state, action) => {
        state.updateStatus = LoadingType.FAILED;
        state.error = action.payload?.message || 'Failed to update review';
      });

    // ===============================
    // DELETE REVIEW
    // ===============================
    builder
      .addCase(deleteReviewAction.pending, (state) => {
        state.deleteStatus = LoadingType.LOADING;
        state.error = null;
      })
      .addCase(
        deleteReviewAction.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.deleteStatus = LoadingType.SUCCEEDED;
          
          // Supprimer de myReviews
          state.myReviews = state.myReviews.filter(r => r.id !== action.payload);
          
          // Réinitialiser selectedReview si c'est la même
          if (state.selectedReview?.id === action.payload) {
            state.selectedReview = null;
          }
          
          state.error = null;
        }
      )
      .addCase(deleteReviewAction.rejected, (state, action) => {
        state.deleteStatus = LoadingType.FAILED;
        state.error = action.payload?.message || 'Failed to delete review';
      });
  },
});

export const {
  clearReviewError,
  resetCreateStatus,
  resetUpdateStatus,
  resetDeleteStatus,
  clearSellerReviews,
  clearSelectedReview,
} = reviewSlice.actions;

// ===============================
// SELECTORS
// ===============================

export const selectMyReviews = (state: any) => state.review.myReviews;
export const selectSellerReviews = (state: any) => state.review.sellerReviews;
export const selectSelectedReview = (state: any) => state.review.selectedReview;
export const selectReviewsError = (state: any) => state.review.error;
export const selectReviewCreateStatus = (state: any) => state.review.createStatus;
export const selectReviewUpdateStatus = (state: any) => state.review.updateStatus;
export const selectReviewDeleteStatus = (state: any) => state.review.deleteStatus;
export const selectSellerReviewsStatus = (state: any) => state.review.sellerStatus;
export const selectMyReviewsStatus = (state: any) => state.review.myReviewsStatus;

// Sélecteurs utiles
export const selectHasUserReviewedSeller = (state: any, sellerId: string) =>
  state.review.myReviews.some((review: Review) => review.authorId === sellerId);

export const selectUserReviewForSeller = (state: any, sellerId: string) =>
  state.review.myReviews.find((review: Review) => review.authorId === sellerId);

// Constante par défaut pour éviter la création d'un nouvel objet à chaque fois
const DEFAULT_RATING_STATS = {
  totalReviews: 0,
  averageRating: 0,
  ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
};

// Sélecteur mémorisé pour les statistiques de rating (comme React)
export const selectUserRatingStats = createSelector(
  [(state: any) => state.review.sellerReviews],
  (sellerReviews) => {
    if (!sellerReviews || !sellerReviews.statistics) {
      return DEFAULT_RATING_STATS;
    }
    return sellerReviews.statistics;
  }
);

export default reviewSlice.reducer;
