import { createAsyncThunk } from '@reduxjs/toolkit';
import API_CONFIG from '../../config/api.config';

// ===============================
// TYPES ET INTERFACES
// ===============================

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface ThunkApi {
  rejectValue: {
    message: string;
  };
}

// ===============================
// ACTIONS PUBLIQUES
// ===============================

/**
 * Envoie un message de contact (public)
 * Backend: POST /contact
 */
export const createContactAction = createAsyncThunk<
  ContactResponse,
  ContactForm,
  ThunkApi
>(
  'contact/create',
  async (form, { rejectWithValue }) => {
    try {
      // Validation côté client
      if (!form.name || !form.email || !form.subject || !form.message) {
        throw new Error('Tous les champs sont requis');
      }

      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        throw new Error('Email invalide');
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.meta?.message || "Échec de l'envoi du message");
      }

      return data.data;
    } catch (error: unknown) {
      return rejectWithValue({
        message: (error as Error).message || "Une erreur est survenue lors de l'envoi du message",
      });
    }
  }
);
