/**
 * PAYMENT STORE ACTIONS
 * Actions Redux pour la gestion des paiements
 * 
 * NOTE IMPORTANTE:
 * - initiatePaymentAction existe mais est rarement utilisé directement
 * - La plupart des paiements passent par assignForfaitWithPaymentAction (store forfait)
 * - Ce store est principalement pour: vérifier statut paiement + consulter historique
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../../config/api.config';
import {
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  CheckPaymentStatusResponse,
  GetUserPaymentsResponse,
} from './types';

/**
 * Helper pour les requêtes API
 */
const apiRequest = async <T>(
  url: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<T> => {
  const token = await AsyncStorage.getItem('buyAndSale-token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method === 'POST') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur API');
  }

  const data = await response.json();
  return data.data || data;
};

/**
 * ==========================================
 * 1. INITIATE PAYMENT (AUTH)
 * ==========================================
 * POST /payments/initiate
 * Initier un paiement de forfait (rarement utilisé directement)
 * 
 * PRÉFÉREZ UTILISER: assignForfaitWithPaymentAction du store forfait
 * qui gère la vérification d'éligibilité + initialisation paiement
 */
export const initiatePaymentAction = createAsyncThunk<
  InitiatePaymentResponse,
  InitiatePaymentRequest,
  { rejectValue: string }
>(
  'payment/initiatePayment',
  async ({ productId, forfaitId, phoneNumber }, { rejectWithValue }) => {
    try {
      const response = await apiRequest<InitiatePaymentResponse>(
        '/payments/initiate',
        'POST',
        { productId, forfaitId, phoneNumber }
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors de l\'initiation du paiement');
    }
  }
);

/**
 * ==========================================
 * 2. CHECK PAYMENT STATUS (AUTH)
 * ==========================================
 * GET /payments/:paymentId/status
 * Vérifier le statut d'un paiement (PENDING → SUCCESS/FAILED)
 * 
 * Usage: Polling après initiation paiement
 * Rate limit: 40 requêtes/minute (1 toutes les 1.5 secondes)
 */
export const checkPaymentStatusAction = createAsyncThunk<
  CheckPaymentStatusResponse,
  string, // paymentId
  { rejectValue: string }
>(
  'payment/checkPaymentStatus',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await apiRequest<CheckPaymentStatusResponse>(
        `/payments/${paymentId}/status`
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors de la vérification du statut');
    }
  }
);

/**
 * ==========================================
 * 3. GET USER PAYMENTS HISTORY (AUTH)
 * ==========================================
 * GET /payments/history?page=1&limit=10
 * Récupérer l'historique des paiements de l'utilisateur
 */
export const getUserPaymentsAction = createAsyncThunk<
  GetUserPaymentsResponse,
  { page?: number; limit?: number },
  { rejectValue: string }
>(
  'payment/getUserPayments',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await apiRequest<GetUserPaymentsResponse>(
        `/payments/history?page=${page}&limit=${limit}`
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors de la récupération de l\'historique');
    }
  }
);
