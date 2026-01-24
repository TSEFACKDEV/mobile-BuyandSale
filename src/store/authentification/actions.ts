import { createAsyncThunk } from '@reduxjs/toolkit';
import API_ENDPOINTS from '../../helpers/api';
import API_CONFIG from '../../config/api.config';
import fetchWithAuth from '../../utils/fetchWithAuth';
import type { ThunkApi } from '../../models/store';
import type { ApiResponse } from '../../models/base';
import type { AuthUser, UserLoginForm, ProfileResponse } from '../../models/user';

// Action de connexion
export const loginAction = createAsyncThunk<
  ApiResponse<AuthUser>,
  UserLoginForm,
  ThunkApi
>('auth/login', async (args, apiThunk) => {
  try {
    // Validation des données d'entrée
    if (!args.identifiant || !args.password) {
      throw new Error('Identifiant et mot de passe requis');
    }

    // Validation pour email OU téléphone
    const isEmail = args.identifiant.includes('@');
    const isPhone = args.identifiant.startsWith('+237');

    if (!isEmail && !isPhone) {
      throw new Error("Format d'identifiant invalide");
    }

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_LOGIN}`,
      {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        credentials: 'include', // Important pour recevoir le cookie refresh token
        body: JSON.stringify(args),
      }
    );

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Réponse serveur invalide');
    }

    if (!response.ok) {
      const errorMessage = data?.meta?.message || data?.message || 'Erreur de connexion';

      // Vérifier si c'est une erreur de suspension
      if (
        data?.data?.status === 'SUSPENDED' ||
        errorMessage.includes('suspendu')
      ) {
        throw new Error('ACCOUNT_SUSPENDED');
      }

      throw new Error(errorMessage);
    }

    // Validation de la réponse
    if (!data.meta || data.meta.status !== 200 || !data.data) {
      throw new Error('Réponse de connexion invalide');
    }

    return data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur de connexion inconnue';

    return apiThunk.rejectWithValue({
      message: errorMessage,
    });
  }
});

// Action de déconnexion
export const logoutAction = createAsyncThunk<void, void, ThunkApi>(
  'auth/logout',
  async () => {
    try {
      // Appel backend pour nettoyer les cookies
      await fetch(`${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_LOGOUT}`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        credentials: 'include', // Important pour envoyer le cookie
      });

      return;
    } catch (error: unknown) {
      // Ne pas rejeter car on veut toujours déconnecter localement
      return;
    }
  }
);

// Action pour récupérer le profil utilisateur
export const getUserProfileAction = createAsyncThunk<
  ApiResponse<ProfileResponse['user']>,
  void,
  ThunkApi
>('auth/profile', async (_, apiThunk) => {
  try {
    const response = await fetchWithAuth(
      `${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_PROFILE}`
    );

    const data = await response.json();

    if (!response.ok) {
      // Si l'utilisateur est suspendu, déclencher une déconnexion
      if (
        data?.data?.status === 'SUSPENDED' ||
        data?.message?.includes('suspendu')
      ) {
        apiThunk.dispatch(logoutAction());
        throw new Error('ACCOUNT_SUSPENDED');
      }

      throw new Error('Failed to fetch user profile');
    }

    return data;
  } catch (error: unknown) {
    return apiThunk.rejectWithValue({
      message:
        (error as Error).message ||
        'An error occurred while fetching user profile',
    });
  }
});

// Action pour gérer le callback OAuth Google
export const handleSocialAuthCallback = createAsyncThunk<
  ApiResponse<AuthUser>,
  string,
  ThunkApi
>('auth/socialCallback', async (token, apiThunk) => {
  try {
    if (!token) {
      throw new Error('Token non reçu depuis le service d\'authentification');
    }

    // Utiliser le token pour récupérer les informations utilisateur
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_PROFILE}`,
      {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data?.meta?.message ||
        data?.message ||
        'Échec de récupération des informations utilisateur';
      throw new Error(errorMessage);
    }

    // Retourner les données
    return data;
  } catch (error: unknown) {
    return apiThunk.rejectWithValue({
      message: (error as Error).message || 'Erreur d\'authentification sociale',
    });
  }
});

// Action pour mettre à jour le profil utilisateur
export const updateUserAction = createAsyncThunk<
  ApiResponse<AuthUser>,
  {
    id: string;
    updates: Partial<AuthUser>;
  },
  ThunkApi
>('auth/updateUser', async ({ id, updates }, apiThunk) => {
  try {
    const response = await fetchWithAuth(
      `${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_UPDATE.replace(':id', id)}`,
      {
        method: 'PUT',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(updates),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.meta?.message || 'Échec de la mise à jour du profil');
    }

    return data;
  } catch (error: unknown) {
    return apiThunk.rejectWithValue({
      message:
        (error as Error).message ||
        'Une erreur est survenue lors de la mise à jour du profil',
    });
  }
});
