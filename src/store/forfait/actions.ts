/**
 * FORFAIT STORE ACTIONS
 * Actions Redux pour la gestion des forfaits
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../../config/api.config';
import {
  GetAllForfaitsResponse,
  GetProductForfaitsResponse,
  CheckEligibilityRequest,
  CheckEligibilityResponse,
  AssignForfaitRequest,
  AssignForfaitResponse,
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
 * 1. GET ALL FORFAITS (PUBLIC)
 * ==========================================
 * GET /forfait
 * Récupérer tous les forfaits disponibles à l'achat
 */
export const getAllForfaitsAction = createAsyncThunk<
  GetAllForfaitsResponse[],
  void,
  { rejectValue: string }
>(
  'forfait/getAllForfaits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest<GetAllForfaitsResponse[]>('/forfait');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors de la récupération des forfaits');
    }
  }
);

/**
 * ==========================================
 * 2. GET PRODUCT FORFAITS (PUBLIC)
 * ==========================================
 * GET /forfait/product/:productId
 * Récupérer les forfaits actifs d'un produit spécifique
 */
export const getProductForfaitsAction = createAsyncThunk<
  GetProductForfaitsResponse,
  string,
  { rejectValue: string }
>(
  'forfait/getProductForfaits',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await apiRequest<GetProductForfaitsResponse>(
        `/forfait/product/${productId}`
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors de la récupération des forfaits du produit');
    }
  }
);

/**
 * ==========================================
 * 3. CHECK ELIGIBILITY (AUTH)
 * ==========================================
 * GET /forfait/check-eligibility?productId=xxx&forfaitType=xxx
 * Vérifier si un forfait peut être assigné avant paiement
 */
export const checkForfaitEligibilityAction = createAsyncThunk<
  CheckEligibilityResponse,
  CheckEligibilityRequest,
  { rejectValue: string }
>(
  'forfait/checkEligibility',
  async ({ productId, forfaitType }, { rejectWithValue }) => {
    try {
      const response = await apiRequest<CheckEligibilityResponse>(
        `/forfait/check-eligibility?productId=${productId}&forfaitType=${forfaitType}`
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors de la vérification de l\'éligibilité');
    }
  }
);

/**
 * ==========================================
 * 4. ASSIGN FORFAIT WITH PAYMENT (AUTH)
 * ==========================================
 * POST /forfait/assign-with-payment
 * Initier le paiement pour l'achat d'un forfait
 */
export const assignForfaitWithPaymentAction = createAsyncThunk<
  AssignForfaitResponse,
  AssignForfaitRequest,
  { rejectValue: string }
>(
  'forfait/assignForfaitWithPayment',
  async ({ productId, forfaitType, phoneNumber }, { rejectWithValue }) => {
    try {
      const response = await apiRequest<AssignForfaitResponse>(
        '/forfait/assign-with-payment',
        'POST',
        { productId, forfaitType, phoneNumber }
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors de l\'assignation du forfait');
    }
  }
);
