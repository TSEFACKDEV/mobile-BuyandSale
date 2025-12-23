import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../../config/api.config';

// ===============================
// TYPES ET INTERFACES
// ===============================

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: string | null;
  link: string | null;
  data: Record<string, unknown> | null;
  createdAt: string;
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
 * Récupère toutes les notifications de l'utilisateur connecté
 * Backend: GET /notification
 */
export const fetchNotificationsAction = createAsyncThunk<
  Notification[],
  void,
  ThunkApi
>(
  'notification/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/notification`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Failed to fetch notifications');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'An error occurred while fetching notifications',
      });
    }
  }
);

/**
 * Marque une notification comme lue
 * Backend: PATCH /notification/:id/read
 */
export const markAsReadAction = createAsyncThunk<
  Notification,
  string,
  ThunkApi
>(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/notification/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Failed to mark notification as read');
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'An error occurred while marking notification as read',
      });
    }
  }
);

/**
 * Marque toutes les notifications comme lues
 * Backend: PATCH /notification/mark-all-read
 */
export const markAllAsReadAction = createAsyncThunk<
  void,
  void,
  ThunkApi
>(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/notification/mark-all-read`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || 'Failed to mark all notifications as read');
      }

      return;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || 'An error occurred while marking all notifications as read',
      });
    }
  }
);
