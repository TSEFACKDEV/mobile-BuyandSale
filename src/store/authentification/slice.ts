import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { LoadingType, type AsyncState } from '../../models/store';
import type { AuthUser, Token } from '../../models/user';
import { loginAction, logoutAction, getUserProfileAction, handleSocialAuthCallback, updateUserAction } from './actions';
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
    entities: null, // Sera chargé de manière asynchrone
    pagination: null,
    status: LoadingType.IDLE as LoadingType,
    error: null,
  },
};

const authentificationSlice = createSlice({
  name: 'authentification',
  initialState,
  reducers: {
    // Définir le token d'accès
    setAccessToken: (state, action: PayloadAction<Token>) => {
      if (state.auth && state.auth.entities && action.payload) {
        state.auth.entities.token = action.payload;
      }
    },
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
        if (action.payload && action.payload.data) {
          // Adapter pour BuyAndSale: la structure est { data: { user, token } }
          const responseData = action.payload
            .data as unknown as BuyAndSaleLoginResponse;
          if (responseData.user && responseData.token) {
            const authUser: AuthUser = {
              ...responseData.user,
              token: responseData.token,
            };

            state.auth.entities = authUser;
            // Redux Persist va automatiquement sauvegarder - pas besoin de Utils.saveInLocalStorage
          } else {
            // Fallback au format direct
            state.auth.entities = action.payload.data as AuthUser;
          }
        }
        state.auth.error = null;
      })
      .addCase(loginAction.rejected, (state, action) => {
        const errorMessage = getErrorMessage(action);
        state.auth.error = {
          meta: {
            status: 500,
            message: errorMessage,
          },
          error: null,
        };
        state.auth.status = LoadingType.FAILED;
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
        // Redux Persist va automatiquement sauvegarder l'état vide
      })
      .addCase(logoutAction.rejected, (state, action) => {
        // Même en cas d'erreur, on déconnecte l'utilisateur localement
        state.auth.entities = null;
        state.auth.status = LoadingType.IDLE;
        state.auth.error = null;
      })

      // === GET PROFILE ===
      .addCase(getUserProfileAction.fulfilled, (state, action) => {
        if (action.payload && action.payload.data && state.auth.entities) {
          // Ne mettre à jour que si les données ont vraiment changé
          const userWithProducts = action.payload.data;
          const currentUser = state.auth.entities;

          // Vérifier si les données de base ont changé
          const hasStatusChanged = userWithProducts.status !== currentUser.status;
          const hasBasicInfoChanged =
            userWithProducts.firstName !== currentUser.firstName ||
            userWithProducts.lastName !== currentUser.lastName ||
            userWithProducts.email !== currentUser.email ||
            userWithProducts.avatar !== currentUser.avatar;

          // Mettre à jour seulement si nécessaire
          if (hasStatusChanged || hasBasicInfoChanged || !currentUser._count) {
            state.auth.entities = {
              ...state.auth.entities,
              ...userWithProducts,
            };
            // Redux Persist va automatiquement sauvegarder
          }
        }
      })
      .addCase(getUserProfileAction.rejected, (_) => {
        // Error handling silenced - ne pas déconnecter l'utilisateur
      })

      // === GOOGLE AUTH CALLBACK ===
      .addCase(handleSocialAuthCallback.pending, (state) => {
        state.auth.error = null;
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(handleSocialAuthCallback.fulfilled, (state, action) => {
        state.auth.status = LoadingType.SUCCESS;
        if (action.payload && action.payload.data) {
          // Même traitement que pour le login classique
          const responseData = action.payload
            .data as unknown as BuyAndSaleLoginResponse;
          if (responseData.user && responseData.token) {
            const authUser: AuthUser = {
              ...responseData.user,
              token: responseData.token,
            };

            state.auth.entities = authUser;
            // Redux Persist va automatiquement sauvegarder
          } else {
            // Fallback au format direct
            state.auth.entities = action.payload.data as AuthUser;
          }
        }
        state.auth.error = null;
      })
      .addCase(handleSocialAuthCallback.rejected, (state, action) => {
        const errorMessage = getErrorMessage(action);
        state.auth.error = {
          meta: {
            status: 500,
            message: errorMessage,
          },
          error: null,
        };
        state.auth.status = LoadingType.FAILED;
      })

      // === UPDATE USER ===
      .addCase(updateUserAction.pending, (state) => {
        state.auth.status = LoadingType.PENDING;
      })
      .addCase(updateUserAction.fulfilled, (state, action) => {
        state.auth.status = LoadingType.SUCCESS;
        if (action.payload && action.payload.data && state.auth.entities) {
          // Mettre à jour les informations de l'utilisateur connecté
          state.auth.entities = {
            ...state.auth.entities,
            ...action.payload.data,
          };
        }
        state.auth.error = null;
      })
      .addCase(updateUserAction.rejected, (state, action) => {
        const errorMessage = getErrorMessage(action);
        state.auth.error = {
          meta: {
            status: 500,
            message: errorMessage,
          },
          error: null,
        };
        state.auth.status = LoadingType.FAILED;
      });
  },
});

export const selectUserAuthenticated = (state: { authentification: AuthentificationState }) =>
  state.authentification.auth;

export const { resetAuthStatus, setAccessToken } =
  authentificationSlice.actions;
export default authentificationSlice;
