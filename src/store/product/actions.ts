import { createAsyncThunk } from '@reduxjs/toolkit';
import API_CONFIG from '../../config/api.config';
import fetchWithAuth from '../../utils/fetchWithAuth';

// ===============================
// TYPES ET INTERFACES
// ===============================

export interface Product {
  id: string;
  slug?: string; // Slug SEO-friendly
  name: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  status: 'PENDING' | 'VALIDATED' | 'REJECTED';
  etat: 'NEUF' | 'OCCASION' | 'CORRECT';
  quartier?: string;
  telephone: string;
  viewCount?: number;
  categoryId: string;
  cityId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  // Relations incluses par les includes backend
  category: {
    id: string;
    name: string;
    slug?: string;
    description?: string;
  };
  city: {
    id: string;
    name: string;
    slug?: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    phone?: string;
    isVerified?: boolean;
  };
  // Relations forfaits
  productForfaits?: Array<{
    id: string;
    forfait: { type: string };
    isActive: boolean;
    expiresAt: string;
  }>;
}

export interface ProductListResponse {
  products: Product[];
  links: {
    perpage?: number;
    prevPage?: number | null;
    currentPage?: number;
    nextPage?: number | null;
    totalPage?: number;
    total: number;
  };
}

export interface CategoryProductsResponse extends ProductListResponse {
  category: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface SellerProductsResponse extends ProductListResponse {
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    name: string;
    avatar?: string | null;
    phone?: string;
    email?: string;
  };
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  cityId?: string;
  priceMin?: number;
  priceMax?: number;
  etat?: 'NEUF' | 'OCCASION' | 'CORRECT';
  page?: number;
  limit?: number;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  quantity: number;
  description: string;
  categoryId: string;
  cityId: string;
  etat: 'NEUF' | 'OCCASION' | 'CORRECT';
  quartier?: string;
  telephone?: string;
  images: any[]; // Images to upload (FormData)
}

export interface UpdateProductPayload {
  id: string;
  name?: string;
  price?: number;
  quantity?: number;
  description?: string;
  categoryId?: string;
  cityId?: string;
  images?: any[]; // Optional new images
}

export interface ProductViewResponse {
  isNewView: boolean;
  viewCount: number;
}

export interface ProductStatsResponse {
  productId: string;
  productName: string;
  viewCount: number;      // Compteur total
  uniqueViews: number;    // Nombre exact de vues uniques
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
 * Récupère les produits pour la page Home (12 derniers)
 * Backend: GET /product?page=1&limit=12
 */
export const getHomeProductsAction = createAsyncThunk<
  ProductListResponse,
  void,
  ThunkApi
>(
  'product/getHome',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/product?page=1&limit=12`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Erreur lors de la récupération des produits');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'Erreur lors de la récupération des produits',
      });
    }
  }
);

/**
 * Récupère tous les produits validés (marketplace publique)
 * Backend: GET /product?search=...&categoryId=...&cityId=...&priceMin=...&priceMax=...&etat=...&page=...&limit=...
 */
export const getValidatedProductsAction = createAsyncThunk<
  ProductListResponse,
  ProductFilters,
  ThunkApi
>(
  'product/getValidated',
  async (filters, { rejectWithValue }) => {
    try {
      const {
        search,
        categoryId,
        cityId,
        priceMin,
        priceMax,
        etat,
        page = 1,
        limit = 10,
      } = filters;

      // Construction des query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append('search', search);
      if (categoryId) params.append('categoryId', categoryId);
      if (cityId) params.append('cityId', cityId);
      if (priceMin !== undefined) params.append('priceMin', priceMin.toString());
      if (priceMax !== undefined) params.append('priceMax', priceMax.toString());
      if (etat) params.append('etat', etat);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/product?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Erreur lors de la récupération des produits');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'Erreur lors de la récupération des produits',
      });
    }
  }
);

/**
 * Récupère les produits d'une catégorie spécifique
 * Backend: GET /product/category/:categoryId/products
 */
export const getCategoryProductsAction = createAsyncThunk<
  CategoryProductsResponse,
  { categoryId: string; filters?: Omit<ProductFilters, 'categoryId'> },
  ThunkApi
>(
  'product/getByCategory',
  async ({ categoryId, filters = {} }, { rejectWithValue }) => {
    try {
      const { search, cityId, priceMin, priceMax, etat, page = 1, limit = 10 } = filters;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append('search', search);
      if (cityId) params.append('cityId', cityId);
      if (priceMin !== undefined) params.append('priceMin', priceMin.toString());
      if (priceMax !== undefined) params.append('priceMax', priceMax.toString());
      if (etat) params.append('etat', etat);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/product/category/${categoryId}/products?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Erreur lors de la récupération des produits');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'Erreur lors de la récupération des produits',
      });
    }
  }
);

// ===============================
// ROUTES AUTHENTIFIÉES
// ===============================

/**
 * Récupère les détails d'un produit par ID ou slug (authentifié)
 * Backend: GET /product/:id
 */
export const getProductByIdAction = createAsyncThunk<
  Product,
  string,
  ThunkApi
>(
  'product/getById',
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      const url = `${API_CONFIG.BASE_URL}/product/${productId}`;
      
      const response = await fetchWithAuth(url, {
        method: 'GET',
      });

      const data = await response.json();

      if (response.status === 401) {
        const { logoutAction } = require('../authentification/actions');
        dispatch(logoutAction());
        throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Erreur lors de la récupération du produit');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'Erreur lors de la récupération du produit',
      });
    }
  }
);

/**
 * Récupère les produits d'un vendeur spécifique (authentifié)
 * Backend: GET /product/seller/:sellerId
 */
export const getSellerProductsAction = createAsyncThunk<
  SellerProductsResponse,
  { sellerId: string; search?: string; page?: number; limit?: number },
  ThunkApi
>(
  'product/getBySeller',
  async ({ sellerId, search, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append('search', search);

      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/product/seller/${sellerId}?${params}`,
        {
          method: 'GET',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Erreur lors de la récupération des produits du vendeur');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'Erreur lors de la récupération des produits',
      });
    }
  }
);

/**
 * Récupère les produits d'un utilisateur spécifique (authentifié)
 * Backend: GET /product/user/:userId
 */
export const getUserProductsAction = createAsyncThunk<
  ProductListResponse,
  { userId: string; search?: string; page?: number; limit?: number },
  ThunkApi
>(
  'product/getByUser',
  async ({ userId, search, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append('search', search);

      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/product/user/${userId}?${params}`,
        {
          method: 'GET',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Erreur lors de la récupération des produits');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'Erreur lors de la récupération des produits',
      });
    }
  }
);

/**
 * Récupère les produits en attente de l'utilisateur connecté
 * Backend: GET /product/my-pending
 */
export const getMyPendingProductsAction = createAsyncThunk<
  ProductListResponse,
  void,
  ThunkApi
>(
  'product/getMyPending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/product/my-pending`,
        {
          method: 'GET',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Erreur lors de la récupération des produits en attente');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'Erreur lors de la récupération des produits',
      });
    }
  }
);

/**
 * Crée un nouveau produit avec upload d'images
 * Backend: POST /product
 * Note: Utilise FormData pour l'upload d'images
 */
export const createProductAction = createAsyncThunk<
  { product: Product },
  CreateProductPayload,
  ThunkApi
>(
  'product/create',
  async (payload, { rejectWithValue }) => {
    try {
      // Création du FormData pour l'upload d'images
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('price', payload.price.toString());
      formData.append('quantity', payload.quantity.toString());
      formData.append('description', payload.description);
      formData.append('categoryId', payload.categoryId);
      formData.append('cityId', payload.cityId);
      formData.append('etat', payload.etat);
      
      if (payload.quartier) formData.append('quartier', payload.quartier);
      if (payload.telephone) formData.append('telephone', payload.telephone);

      // Ajout des images
      payload.images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || `image_${index}.jpg`,
        } as any);
      });

      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/product`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Erreur lors de la création du produit');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'Erreur lors de la création du produit',
      });
    }
  }
);

/**
 * Met à jour un produit existant
 * Backend: PUT /product/:id
 */
export const updateProductAction = createAsyncThunk<
  { product: Product },
  UpdateProductPayload,
  ThunkApi
>(
  'product/update',
  async (payload, { rejectWithValue }) => {
    try {
      const { id, ...updateData } = payload;

      // Création du FormData si des images sont fournies
      let body: any;

      if (updateData.images && updateData.images.length > 0) {
        const formData = new FormData();
        
        if (updateData.name) formData.append('name', updateData.name);
        if (updateData.price !== undefined) formData.append('price', updateData.price.toString());
        if (updateData.quantity !== undefined) formData.append('quantity', updateData.quantity.toString());
        if (updateData.description) formData.append('description', updateData.description);
        if (updateData.categoryId) formData.append('categoryId', updateData.categoryId);
        if (updateData.cityId) formData.append('cityId', updateData.cityId);

        updateData.images.forEach((image, index) => {
          formData.append('images', {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.fileName || `image_${index}.jpg`,
          } as any);
        });

        body = formData;
      } else {
        body = JSON.stringify(updateData);
      }

      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/product/${id}`,
        {
          method: 'PUT',
          body,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Erreur lors de la mise à jour du produit');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'Erreur lors de la mise à jour du produit',
      });
    }
  }
);

/**
 * Supprime un produit
 * Backend: DELETE /product/:id
 */
export const deleteProductAction = createAsyncThunk<
  { productId: string },
  string,
  ThunkApi
>(
  'product/delete',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/product/${productId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Erreur lors de la suppression du produit');
      }

      return { productId };
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'Erreur lors de la suppression du produit',
      });
    }
  }
);

/**
 * Enregistre une vue de produit (utilisateur connecté)
 * Backend: POST /product/:productId/view
 */
export const recordProductViewAction = createAsyncThunk<
  ProductViewResponse,
  string,
  ThunkApi
>(
  'product/recordView',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/product/${productId}/view`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Erreur lors de l\'enregistrement de la vue');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'Erreur lors de l\'enregistrement de la vue',
      });
    }
  }
);

/**
 * Récupère les statistiques de vues d'un produit
 * Backend: GET /product/:productId/stats
 */
export const getProductViewStatsAction = createAsyncThunk<
  ProductStatsResponse,
  string,
  ThunkApi
>(
  'product/getStats',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/product/${productId}/stats`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Erreur lors de la récupération des statistiques');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'Erreur lors de la récupération des statistiques',
      });
    }
  }
);
