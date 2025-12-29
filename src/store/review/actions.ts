import { createAsyncThunk } from '@reduxjs/toolkit';
import API_CONFIG from '../../config/api.config';
import fetchWithAuth from '../../utils/fetchWithAuth';

// ===============================
// TYPES ET INTERFACES
// ===============================

export interface Review {
  id: string;
  rating: number;
  userId: string;
  authorId: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface SellerReviewsResponse {
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  reviews: Review[];
  statistics: ReviewStatistics;
}

export interface CreateReviewPayload {
  sellerId: string;
  rating: number;
}

export interface UpdateReviewPayload {
  id: string;
  rating: number;
}

interface ThunkApi {
  rejectValue: {
    message: string;
  };
}

// ===============================
// ROUTES PUBLIQUES
// ===============================

/**
 * Récupère les reviews d'un vendeur spécifique (public)
 * Backend: GET /review/seller/:userId
 */
export const getSellerReviewsAction = createAsyncThunk<
  SellerReviewsResponse,
  string,
  ThunkApi
>(
  'review/getSeller',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/review/seller/${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Failed to fetch seller reviews');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'An error occurred while fetching seller reviews',
      });
    }
  }
);

/**
 * Récupère une review par ID (public)
 * Backend: GET /review/:id
 */
export const getReviewByIdAction = createAsyncThunk<
  Review,
  string,
  ThunkApi
>(
  'review/getById',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/review/${reviewId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Failed to fetch review');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'An error occurred while fetching review',
      });
    }
  }
);

// ===============================
// ACTIONS AUTHENTIFIÉES
// ===============================

/**
 * Récupère mes reviews (authentifié)
 * Backend: GET /review/my-reviews
 */
export const getMyReviewsAction = createAsyncThunk<
  { reviews: Review[] },
  void,
  ThunkApi
>(
  'review/getMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/review/my-reviews`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Failed to fetch my reviews');
      }

      return { reviews: data.data };
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'An error occurred while fetching your reviews',
      });
    }
  }
);

/**
 * Crée une nouvelle review (authentifié)
 * Backend: POST /review
 */
export const createReviewAction = createAsyncThunk<
  Review,
  CreateReviewPayload,
  ThunkApi
>(
  'review/create',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/review`,
        {
          method: 'POST',
          body: JSON.stringify(reviewData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Failed to create review');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'An error occurred while creating review',
      });
    }
  }
);

/**
 * Met à jour une review existante (authentifié)
 * Backend: PUT /review/:id
 */
export const updateReviewAction = createAsyncThunk<
  Review,
  UpdateReviewPayload,
  ThunkApi
>(
  'review/update',
  async ({ id, rating }, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/review/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ rating }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Failed to update review');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'An error occurred while updating review',
      });
    }
  }
);

/**
 * Supprime une review (authentifié)
 * Backend: DELETE /review/:id
 */
export const deleteReviewAction = createAsyncThunk<
  string,
  string,
  ThunkApi
>(
  'review/delete',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/review/${reviewId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Failed to delete review');
      }

      return reviewId;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'An error occurred while deleting review',
      });
    }
  }
);
