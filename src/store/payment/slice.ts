/**
 * PAYMENT STORE SLICE
 * Gestion de l'état Redux pour les paiements
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaymentState } from './types';
import {
  initiatePaymentAction,
  checkPaymentStatusAction,
  getUserPaymentsAction,
} from './actions';

const initialState: PaymentState = {
  // Paiement en cours
  currentPayment: null,
  initiateLoading: false,
  initiateError: null,

  // Vérification statut
  paymentStatus: null,
  statusLoading: false,
  statusError: null,

  // Historique des paiements
  history: [],
  historyPagination: null,
  historyLoading: false,
  historyError: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    /**
     * Réinitialiser le paiement en cours
     */
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
      state.initiateError = null;
    },

    /**
     * Réinitialiser le statut de paiement
     */
    clearPaymentStatus: (state) => {
      state.paymentStatus = null;
      state.statusError = null;
    },

    /**
     * Réinitialiser complètement le store payment
     */
    resetPaymentStore: () => initialState,
  },
  extraReducers: (builder) => {
    // ==========================================
    // 1. INITIATE PAYMENT
    // ==========================================
    builder
      .addCase(initiatePaymentAction.pending, (state) => {
        state.initiateLoading = true;
        state.initiateError = null;
        state.currentPayment = null;
      })
      .addCase(initiatePaymentAction.fulfilled, (state, action) => {
        state.initiateLoading = false;
        state.currentPayment = action.payload;
        state.initiateError = null;
      })
      .addCase(initiatePaymentAction.rejected, (state, action) => {
        state.initiateLoading = false;
        state.initiateError = action.payload || 'Erreur inconnue';
        state.currentPayment = null;
      });

    // ==========================================
    // 2. CHECK PAYMENT STATUS
    // ==========================================
    builder
      .addCase(checkPaymentStatusAction.pending, (state) => {
        state.statusLoading = true;
        state.statusError = null;
      })
      .addCase(checkPaymentStatusAction.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.paymentStatus = action.payload;
        state.statusError = null;
      })
      .addCase(checkPaymentStatusAction.rejected, (state, action) => {
        state.statusLoading = false;
        state.statusError = action.payload || 'Erreur inconnue';
      });

    // ==========================================
    // 3. GET USER PAYMENTS HISTORY
    // ==========================================
    builder
      .addCase(getUserPaymentsAction.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(getUserPaymentsAction.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history = action.payload.payments;
        state.historyPagination = action.payload.pagination;
        state.historyError = null;
      })
      .addCase(getUserPaymentsAction.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload || 'Erreur inconnue';
      });
  },
});

export const {
  clearCurrentPayment,
  clearPaymentStatus,
  resetPaymentStore,
} = paymentSlice.actions;

export default paymentSlice.reducer;
