import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  Product,
  ProductListResponse,
  CategoryProductsResponse,
  SellerProductsResponse,
  ProductViewResponse,
  ProductStatsResponse,
} from './actions';
import {
  getHomeProductsAction,
  getValidatedProductsAction,
  getCategoryProductsAction,
  getProductByIdAction,
  getSellerProductsAction,
  getUserProductsAction,
  getMyPendingProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  recordProductViewAction,
  getProductViewStatsAction,
} from './actions';

// ===============================
// TYPES
// ===============================

type LoadingType = 'idle' | 'loading' | 'succeeded' | 'failed';

// ===============================
// STATE INTERFACE
// ===============================

interface ProductState {
  // Produits page Home
  homeProducts: Product[];
  homeProductsStatus: LoadingType;
  homeProductsError: string | null;

  // Liste des produits (marketplace)
  validatedProducts: Product[];
  validatedProductsStatus: LoadingType;
  validatedProductsError: string | null;
  validatedProductsPagination: ProductListResponse['links'] | null;

  // Produits par catégorie
  categoryProducts: Product[];
  categoryProductsStatus: LoadingType;
  categoryProductsError: string | null;
  categoryProductsPagination: ProductListResponse['links'] | null;
  currentCategory: CategoryProductsResponse['category'] | null;

  // Détails d'un produit
  currentProduct: Product | null;
  currentProductStatus: LoadingType;
  currentProductError: string | null;

  // Produits d'un vendeur
  sellerProducts: Product[];
  sellerProductsStatus: LoadingType;
  sellerProductsError: string | null;
  sellerProductsPagination: ProductListResponse['links'] | null;
  currentSeller: SellerProductsResponse['seller'] | null;

  // Produits d'un utilisateur
  userProducts: Product[];
  userProductsStatus: LoadingType;
  userProductsError: string | null;
  userProductsPagination: ProductListResponse['links'] | null;

  // Mes produits en attente
  myPendingProducts: Product[];
  myPendingProductsStatus: LoadingType;
  myPendingProductsError: string | null;

  // Création de produit
  createProductStatus: LoadingType;
  createProductError: string | null;

  // Mise à jour de produit
  updateProductStatus: LoadingType;
  updateProductError: string | null;

  // Suppression de produit
  deleteProductStatus: LoadingType;
  deleteProductError: string | null;

  // Vues de produit
  recordViewStatus: LoadingType;
  recordViewError: string | null;
  lastViewResponse: ProductViewResponse | null;

  // Statistiques de produit
  productStats: ProductStatsResponse | null;
  productStatsStatus: LoadingType;
  productStatsError: string | null;
}

// ===============================
// INITIAL STATE
// ===============================

const initialState: ProductState = {
  homeProducts: [],
  homeProductsStatus: 'idle',
  homeProductsError: null,

  validatedProducts: [],
  validatedProductsStatus: 'idle',
  validatedProductsError: null,
  validatedProductsPagination: null,

  categoryProducts: [],
  categoryProductsStatus: 'idle',
  categoryProductsError: null,
  categoryProductsPagination: null,
  currentCategory: null,

  currentProduct: null,
  currentProductStatus: 'idle',
  currentProductError: null,

  sellerProducts: [],
  sellerProductsStatus: 'idle',
  sellerProductsError: null,
  sellerProductsPagination: null,
  currentSeller: null,

  userProducts: [],
  userProductsStatus: 'idle',
  userProductsError: null,
  userProductsPagination: null,

  myPendingProducts: [],
  myPendingProductsStatus: 'idle',
  myPendingProductsError: null,

  createProductStatus: 'idle',
  createProductError: null,

  updateProductStatus: 'idle',
  updateProductError: null,

  deleteProductStatus: 'idle',
  deleteProductError: null,

  recordViewStatus: 'idle',
  recordViewError: null,
  lastViewResponse: null,

  productStats: null,
  productStatsStatus: 'idle',
  productStatsError: null,
};

// ===============================
// SLICE
// ===============================

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    // Réinitialiser le produit courant
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.currentProductStatus = 'idle';
      state.currentProductError = null;
    },

    // Réinitialiser les erreurs de création
    clearCreateProductError: (state) => {
      state.createProductError = null;
      state.createProductStatus = 'idle';
    },

    // Réinitialiser les erreurs de mise à jour
    clearUpdateProductError: (state) => {
      state.updateProductError = null;
      state.updateProductStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    // ===============================
    // GET HOME PRODUCTS
    // ===============================
    builder.addCase(getHomeProductsAction.pending, (state) => {
      state.homeProductsStatus = 'loading';
      state.homeProductsError = null;
    });
    builder.addCase(
      getHomeProductsAction.fulfilled,
      (state, action: PayloadAction<ProductListResponse>) => {
        state.homeProductsStatus = 'succeeded';
        state.homeProducts = action.payload.products;
      }
    );
    builder.addCase(getHomeProductsAction.rejected, (state, action) => {
      state.homeProductsStatus = 'failed';
      state.homeProductsError = action.payload?.message || 'Erreur inconnue';
    });

    // ===============================
    // GET VALIDATED PRODUCTS
    // ===============================
    builder.addCase(getValidatedProductsAction.pending, (state) => {
      state.validatedProductsStatus = 'loading';
      state.validatedProductsError = null;
    });
    builder.addCase(
      getValidatedProductsAction.fulfilled,
      (state, action: PayloadAction<ProductListResponse>) => {
        state.validatedProductsStatus = 'succeeded';
        state.validatedProducts = action.payload.products;
        state.validatedProductsPagination = action.payload.links;
      }
    );
    builder.addCase(getValidatedProductsAction.rejected, (state, action) => {
      state.validatedProductsStatus = 'failed';
      state.validatedProductsError = action.payload?.message || 'Erreur inconnue';
    });

    // ===============================
    // GET CATEGORY PRODUCTS
    // ===============================
    builder.addCase(getCategoryProductsAction.pending, (state) => {
      state.categoryProductsStatus = 'loading';
      state.categoryProductsError = null;
    });
    builder.addCase(
      getCategoryProductsAction.fulfilled,
      (state, action: PayloadAction<CategoryProductsResponse>) => {
        state.categoryProductsStatus = 'succeeded';
        state.categoryProducts = action.payload.products;
        state.categoryProductsPagination = action.payload.links;
        state.currentCategory = action.payload.category;
      }
    );
    builder.addCase(getCategoryProductsAction.rejected, (state, action) => {
      state.categoryProductsStatus = 'failed';
      state.categoryProductsError = action.payload?.message || 'Erreur inconnue';
    });

    // ===============================
    // GET PRODUCT BY ID
    // ===============================
    builder.addCase(getProductByIdAction.pending, (state) => {
      state.currentProductStatus = 'loading';
      state.currentProductError = null;
    });
    builder.addCase(
      getProductByIdAction.fulfilled,
      (state, action: PayloadAction<Product>) => {
        state.currentProductStatus = 'succeeded';
        state.currentProduct = action.payload;
      }
    );
    builder.addCase(getProductByIdAction.rejected, (state, action) => {
      state.currentProductStatus = 'failed';
      state.currentProductError = action.payload?.message || 'Erreur inconnue';
    });

    // ===============================
    // GET SELLER PRODUCTS
    // ===============================
    builder.addCase(getSellerProductsAction.pending, (state) => {
      state.sellerProductsStatus = 'loading';
      state.sellerProductsError = null;
    });
    builder.addCase(
      getSellerProductsAction.fulfilled,
      (state, action: PayloadAction<SellerProductsResponse>) => {
        state.sellerProductsStatus = 'succeeded';
        state.sellerProducts = action.payload.products;
        state.sellerProductsPagination = action.payload.links;
        state.currentSeller = action.payload.seller;
      }
    );
    builder.addCase(getSellerProductsAction.rejected, (state, action) => {
      state.sellerProductsStatus = 'failed';
      state.sellerProductsError = action.payload?.message || 'Erreur inconnue';
    });

    // ===============================
    // GET USER PRODUCTS
    // ===============================
    builder.addCase(getUserProductsAction.pending, (state) => {
      state.userProductsStatus = 'loading';
      state.userProductsError = null;
    });
    builder.addCase(
      getUserProductsAction.fulfilled,
      (state, action: PayloadAction<ProductListResponse>) => {
        state.userProductsStatus = 'succeeded';
        state.userProducts = action.payload.products;
        state.userProductsPagination = action.payload.links;
      }
    );
    builder.addCase(getUserProductsAction.rejected, (state, action) => {
      state.userProductsStatus = 'failed';
      state.userProductsError = action.payload?.message || 'Erreur inconnue';
    });

    // ===============================
    // GET MY PENDING PRODUCTS
    // ===============================
    builder.addCase(getMyPendingProductsAction.pending, (state) => {
      state.myPendingProductsStatus = 'loading';
      state.myPendingProductsError = null;
    });
    builder.addCase(
      getMyPendingProductsAction.fulfilled,
      (state, action: PayloadAction<ProductListResponse>) => {
        state.myPendingProductsStatus = 'succeeded';
        state.myPendingProducts = action.payload.products;
      }
    );
    builder.addCase(getMyPendingProductsAction.rejected, (state, action) => {
      state.myPendingProductsStatus = 'failed';
      state.myPendingProductsError = action.payload?.message || 'Erreur inconnue';
    });

    // ===============================
    // CREATE PRODUCT
    // ===============================
    builder.addCase(createProductAction.pending, (state) => {
      state.createProductStatus = 'loading';
      state.createProductError = null;
    });
    builder.addCase(
      createProductAction.fulfilled,
      (state, action: PayloadAction<{ product: Product }>) => {
        state.createProductStatus = 'succeeded';
        // Ajouter le nouveau produit aux produits en attente
        state.myPendingProducts.unshift(action.payload.product);
      }
    );
    builder.addCase(createProductAction.rejected, (state, action) => {
      state.createProductStatus = 'failed';
      state.createProductError = action.payload?.message || 'Erreur inconnue';
    });

    // ===============================
    // UPDATE PRODUCT
    // ===============================
    builder.addCase(updateProductAction.pending, (state) => {
      state.updateProductStatus = 'loading';
      state.updateProductError = null;
    });
    builder.addCase(
      updateProductAction.fulfilled,
      (state, action: PayloadAction<{ product: Product }>) => {
        state.updateProductStatus = 'succeeded';
        
        // Mettre à jour le produit dans currentProduct
        if (state.currentProduct?.id === action.payload.product.id) {
          state.currentProduct = action.payload.product;
        }

        // Mettre à jour dans myPendingProducts
        const pendingIndex = state.myPendingProducts.findIndex(
          (p) => p.id === action.payload.product.id
        );
        if (pendingIndex !== -1) {
          state.myPendingProducts[pendingIndex] = action.payload.product;
        }

        // Mettre à jour dans validatedProducts
        const validatedIndex = state.validatedProducts.findIndex(
          (p) => p.id === action.payload.product.id
        );
        if (validatedIndex !== -1) {
          state.validatedProducts[validatedIndex] = action.payload.product;
        }
      }
    );
    builder.addCase(updateProductAction.rejected, (state, action) => {
      state.updateProductStatus = 'failed';
      state.updateProductError = action.payload?.message || 'Erreur inconnue';
    });

    // ===============================
    // DELETE PRODUCT
    // ===============================
    builder.addCase(deleteProductAction.pending, (state) => {
      state.deleteProductStatus = 'loading';
      state.deleteProductError = null;
    });
    builder.addCase(
      deleteProductAction.fulfilled,
      (state, action: PayloadAction<{ productId: string }>) => {
        state.deleteProductStatus = 'succeeded';
        
        const productId = action.payload.productId;

        // Retirer de myPendingProducts
        state.myPendingProducts = state.myPendingProducts.filter(
          (p) => p.id !== productId
        );

        // Retirer de validatedProducts
        state.validatedProducts = state.validatedProducts.filter(
          (p) => p.id !== productId
        );

        // Retirer de categoryProducts
        state.categoryProducts = state.categoryProducts.filter(
          (p) => p.id !== productId
        );

        // Retirer de sellerProducts
        state.sellerProducts = state.sellerProducts.filter(
          (p) => p.id !== productId
        );

        // Retirer de userProducts
        state.userProducts = state.userProducts.filter(
          (p) => p.id !== productId
        );

        // Réinitialiser currentProduct si c'est le produit supprimé
        if (state.currentProduct?.id === productId) {
          state.currentProduct = null;
        }
      }
    );
    builder.addCase(deleteProductAction.rejected, (state, action) => {
      state.deleteProductStatus = 'failed';
      state.deleteProductError = action.payload?.message || 'Erreur inconnue';
    });

    // ===============================
    // RECORD PRODUCT VIEW
    // ===============================
    builder.addCase(recordProductViewAction.pending, (state) => {
      state.recordViewStatus = 'loading';
      state.recordViewError = null;
    });
    builder.addCase(
      recordProductViewAction.fulfilled,
      (state, action: PayloadAction<ProductViewResponse>) => {
        state.recordViewStatus = 'succeeded';
        state.lastViewResponse = action.payload;

        // Mettre à jour le viewCount du produit courant
        if (state.currentProduct) {
          state.currentProduct.viewCount = action.payload.viewCount;
        }
      }
    );
    builder.addCase(recordProductViewAction.rejected, (state, action) => {
      state.recordViewStatus = 'failed';
      state.recordViewError = action.payload?.message || 'Erreur inconnue';
    });

    // ===============================
    // GET PRODUCT STATS
    // ===============================
    builder.addCase(getProductViewStatsAction.pending, (state) => {
      state.productStatsStatus = 'loading';
      state.productStatsError = null;
    });
    builder.addCase(
      getProductViewStatsAction.fulfilled,
      (state, action: PayloadAction<ProductStatsResponse>) => {
        state.productStatsStatus = 'succeeded';
        state.productStats = action.payload;
      }
    );
    builder.addCase(getProductViewStatsAction.rejected, (state, action) => {
      state.productStatsStatus = 'failed';
      state.productStatsError = action.payload?.message || 'Erreur inconnue';
    });
  },
});

// ===============================
// EXPORTS
// ===============================

export const {
  clearCurrentProduct,
  clearCreateProductError,
  clearUpdateProductError,
} = productSlice.actions;

// ===============================
// SELECTORS
// ===============================

// Produits validés
export const selectValidatedProducts = (state: any) => state.product.validatedProducts;
export const selectValidatedProductsStatus = (state: any) => state.product.validatedProductsStatus;
export const selectValidatedProductsError = (state: any) => state.product.validatedProductsError;
export const selectValidatedProductsPagination = (state: any) => state.product.validatedProductsPagination;

// Produits par catégorie
export const selectCategoryProducts = (state: any) => state.product.categoryProducts;
export const selectCategoryProductsStatus = (state: any) => state.product.categoryProductsStatus;
export const selectCurrentCategory = (state: any) => state.product.currentCategory;

// Produit actuel
export const selectCurrentProduct = (state: any) => state.product.currentProduct;
export const selectCurrentProductStatus = (state: any) => state.product.currentProductStatus;
export const selectCurrentProductError = (state: any) => state.product.currentProductError;

// Produits du vendeur
export const selectSellerProducts = (state: any) => state.product.sellerProducts;
export const selectSellerProductsStatus = (state: any) => state.product.sellerProductsStatus;
export const selectSellerProductsError = (state: any) => state.product.sellerProductsError;
export const selectSellerPagination = (state: any) => state.product.sellerProductsPagination;
export const selectCurrentSeller = (state: any) => state.product.currentSeller;

// Produits Home
export const selectHomeProducts = (state: any) => state.product.homeProducts;
export const selectHomeProductsStatus = (state: any) => state.product.homeProductsStatus;

// Produits de l'utilisateur
export const selectUserProducts = (state: any) => state.product.userProducts;
export const selectUserProductsStatus = (state: any) => state.product.userProductsStatus;
export const selectUserPagination = (state: any) => state.product.userProductsPagination;

// Mes produits en attente
export const selectMyPendingProducts = (state: any) => state.product.myPendingProducts;
export const selectMyPendingProductsStatus = (state: any) => state.product.myPendingProductsStatus;

// Status de création/mise à jour/suppression
export const selectProductCreateStatus = (state: any) => state.product.createProductStatus;
export const selectProductUpdateStatus = (state: any) => state.product.updateProductStatus;
export const selectProductDeleteStatus = (state: any) => state.product.deleteProductStatus;

// Erreurs
export const selectProductsError = (state: any) => 
  state.product.validatedProductsError || 
  state.product.currentProductError || 
  state.product.createProductError || 
  state.product.updateProductError;

// Statistiques
export const selectProductStats = (state: any) => state.product.productStats;
export const selectProductStatsStatus = (state: any) => state.product.productStatsStatus;

export default productSlice.reducer;
