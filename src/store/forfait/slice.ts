/**
 * FORFAIT STORE SLICE
 * Gestion de l'état Redux pour les forfaits
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ForfaitState } from './types';
import {
  getAllForfaitsAction,
  getProductForfaitsAction,
  checkForfaitEligibilityAction,
  assignForfaitWithPaymentAction,
} from './actions';

const initialState: ForfaitState = {
  // Liste des forfaits disponibles
  forfaits: [],
  forfaitsLoading: false,
  forfaitsError: null,

  // Forfaits actifs sur un produit
  productForfaits: [],
  productForfaitsLoading: false,
  productForfaitsError: null,

  // Éligibilité
  eligibility: null,
  eligibilityLoading: false,
  eligibilityError: null,

  // Assignation avec paiement
  paymentDetails: null,
  assignLoading: false,
  assignError: null,
};

const forfaitSlice = createSlice({
  name: 'forfait',
  initialState,
  reducers: {
    /**
     * Réinitialiser les détails de paiement après traitement
     */
    clearPaymentDetails: (state) => {
      state.paymentDetails = null;
      state.assignError = null;
    },

    /**
     * Réinitialiser l'éligibilité
     */
    clearEligibility: (state) => {
      state.eligibility = null;
      state.eligibilityError = null;
    },

    /**
     * Réinitialiser complètement le store forfait
     */
    resetForfaitStore: () => initialState,
  },
  extraReducers: (builder) => {
    // ==========================================
    // 1. GET ALL FORFAITS
    // ==========================================
    builder
      .addCase(getAllForfaitsAction.pending, (state) => {
        state.forfaitsLoading = true;
        state.forfaitsError = null;
      })
      .addCase(getAllForfaitsAction.fulfilled, (state, action) => {
        state.forfaitsLoading = false;
        state.forfaits = action.payload;
        state.forfaitsError = null;
      })
      .addCase(getAllForfaitsAction.rejected, (state, action) => {
        state.forfaitsLoading = false;
        state.forfaitsError = action.payload || 'Erreur inconnue';
      });

    // ==========================================
    // 2. GET PRODUCT FORFAITS
    // ==========================================
    builder
      .addCase(getProductForfaitsAction.pending, (state) => {
        state.productForfaitsLoading = true;
        state.productForfaitsError = null;
      })
      .addCase(getProductForfaitsAction.fulfilled, (state, action) => {
        state.productForfaitsLoading = false;
        state.productForfaits = action.payload.forfaits;
        state.productForfaitsError = null;
      })
      .addCase(getProductForfaitsAction.rejected, (state, action) => {
        state.productForfaitsLoading = false;
        state.productForfaitsError = action.payload || 'Erreur inconnue';
      });

    // ==========================================
    // 3. CHECK ELIGIBILITY
    // ==========================================
    builder
      .addCase(checkForfaitEligibilityAction.pending, (state) => {
        state.eligibilityLoading = true;
        state.eligibilityError = null;
      })
      .addCase(checkForfaitEligibilityAction.fulfilled, (state, action) => {
        state.eligibilityLoading = false;
        state.eligibility = action.payload;
        state.eligibilityError = null;
      })
      .addCase(checkForfaitEligibilityAction.rejected, (state, action) => {
        state.eligibilityLoading = false;
        state.eligibilityError = action.payload || 'Erreur inconnue';
      });

    // ==========================================
    // 4. ASSIGN FORFAIT WITH PAYMENT
    // ==========================================
    builder
      .addCase(assignForfaitWithPaymentAction.pending, (state) => {
        state.assignLoading = true;
        state.assignError = null;
        state.paymentDetails = null;
      })
      .addCase(assignForfaitWithPaymentAction.fulfilled, (state, action) => {
        state.assignLoading = false;
        state.paymentDetails = action.payload;
        state.assignError = null;
      })
      .addCase(assignForfaitWithPaymentAction.rejected, (state, action) => {
        state.assignLoading = false;
        state.assignError = action.payload || 'Erreur inconnue';
        state.paymentDetails = null;
      });
  },
});

export const {
  clearPaymentDetails,
  clearEligibility,
  resetForfaitStore,
} = forfaitSlice.actions;

// Selectors
export const selectForfaits = (state: any) => state.forfait.forfaits;
export const selectForfaitStatus = (state: any) => {
  if (state.forfait.forfaitsLoading) return 'loading';
  if (state.forfait.forfaits?.length > 0) return 'succeeded';
  return 'idle';
};
export const selectForfaitError = (state: any) => state.forfait.forfaitsError;
export const selectProductForfaits = (state: any) => state.forfait.productForfaits;
export const selectEligibility = (state: any) => state.forfait.eligibility;
export const selectPaymentDetails = (state: any) => state.forfait.paymentDetails;
export const selectAssignLoading = (state: any) => state.forfait.assignLoading;

export default forfaitSlice.reducer;
