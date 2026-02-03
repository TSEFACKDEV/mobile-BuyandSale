import { createSlice } from '@reduxjs/toolkit';
import { LoadingType, type AsyncState } from '../../models/store';
import type { AuthUser, Token } from '../../models/user';
import { 
  loginAction, 
  logoutAction, 
  getUserProfileAction, 
  handleSocialAuthCallback, 
  updateUserAction,
  refreshTokenAction 
} from './actions';
import { getErrorMessage } from '../../utils/errorHelpers';

// Type spécial pour la réponse BuyAndSale
interface BuyAndSaleLoginResponse {
  user: AuthUser;
  token: Token;
}

type AuthentificationState = {
  auth: AsyncState<AuthUser | null>;
};

const initialState: AuthentificationState = {
  auth: {
    entities: null,
    pagination: null,
    status: LoadingType.IDLE as LoadingType,
    error: null,
  },
};

// Helper pour traiter les données de connexion
const setAuthUserFromResponse = (state: AuthentificationState, data: any) => {
  if (!data) return;
  
  const responseData = data as unknown as BuyAndSaleLoginResponse;
  
  if (responseData.user && responseData.token) {
    state.auth.entities = {
      ...responseData.user,
      token: responseData.token,
    };
  } else {
    state.auth.entities = data as AuthUser;
  }
};

// Helper pour gérer les erreurs
const setAuthError = (state: AuthentificationState, action: any) => {
  const errorMessage = getErrorMessage(action);
  state.auth.error = {
    meta: {
      status: 500,
      message: errorMessage,
    },
    error: null,
  };
  state.auth.status = LoadingType.FAILED;
};

const authentificationSlice = createSlice({
  name: 'authentification',
  initialState,
  reducers: {
    // Réinitialiser le statut
    resetAuthStatus: (state) => {
      state.auth.status = LoadingType.IDLE;
    },
  },
  extraReducers: (builder) => {
    builder
      // === LOGIN ===
      .addCase(loginAction.pending, (state) => {
        state.auth.entities = null;
        state.auth.error = null;
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(loginAction.fulfilled, (state, action) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.error = null;
        setAuthUserFromResponse(state, action.payload?.data);
      })
      .addCase(loginAction.rejected, (state, action) => {
        setAuthError(state, action);
      })

      // === LOGOUT ===
      .addCase(logoutAction.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
        state.auth.error = null;
      })
      .addCase(logoutAction.fulfilled, (state) => {
        state.auth.entities = null;
        state.auth.status = LoadingType.IDLE;
        state.auth.error = null;
      })
      .addCase(logoutAction.rejected, (state) => {
        // Même en cas d'erreur, on déconnecte l'utilisateur localement
        state.auth.entities = null;
        state.auth.status = LoadingType.IDLE;
        state.auth.error = null;
      })

      // === GET PROFILE ===
      .addCase(getUserProfileAction.fulfilled, (state, action) => {
        if (action.payload?.data && state.auth.entities) {
          const userWithProducts = action.payload.data;
          const currentUser = state.auth.entities;

          // Vérifier si les données de base ont changé
          const hasChanged = 
            userWithProducts.status !== currentUser.status ||
            userWithProducts.firstName !== currentUser.firstName ||
            userWithProducts.lastName !== currentUser.lastName ||
            userWithProducts.email !== currentUser.email ||
            userWithProducts.avatar !== currentUser.avatar ||
            !currentUser._count;

          if (hasChanged) {
            state.auth.entities = {
              ...state.auth.entities,
              ...userWithProducts,
            };
          }
        }
      })
      .addCase(getUserProfileAction.rejected, () => {
        // Error handling silenced - ne pas déconnecter l'utilisateur
      })

      // === GOOGLE AUTH CALLBACK ===
      .addCase(handleSocialAuthCallback.pending, (state) => {
        state.auth.error = null;
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(handleSocialAuthCallback.fulfilled, (state, action) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.error = null;
        setAuthUserFromResponse(state, action.payload?.data);
      })
      .addCase(handleSocialAuthCallback.rejected, (state, action) => {
        setAuthError(state, action);
      })

      // === REFRESH TOKEN ===
      .addCase(refreshTokenAction.fulfilled, (state, action) => {
        if (action.payload?.data?.token && state.auth.entities) {
          state.auth.entities.token = action.payload.data.token;
        }
      })

      // === UPDATE USER ===
      .addCase(updateUserAction.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(updateUserAction.fulfilled, (state, action) => {
        state.auth.status = LoadingType.SUCCESS;
        state.auth.error = null;
        
        if (action.payload?.data && state.auth.entities) {
          state.auth.entities = {
            ...state.auth.entities,
            ...action.payload.data,
          };
        }
      })
      .addCase(updateUserAction.rejected, (state, action) => {
        setAuthError(state, action);
      });
  },
});

export const selectUserAuthenticated = (state: { authentification: AuthentificationState }) =>
  state.authentification.auth;

export const { resetAuthStatus } = authentificationSlice.actions;
export default authentificationSlice;
