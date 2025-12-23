import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  fetchPublicSellersAction,
  fetchUserByIdAction,
  reportUserAction,
  type AuthUser,
  type UserListResponse,
} from './actions'
import { LoadingType } from '../../models/store'
import type { RootState } from '../index'

// Interface pour l'état du slice (simplifié - pas de CRUD admin)
export interface UserState {
  sellers: AuthUser[] // Liste des vendeurs publics
  currentUser: AuthUser | null // Détails d'un vendeur spécifique
  sellersStatus: LoadingType
  currentUserStatus: LoadingType
  reportStatus: LoadingType
  error: string | null
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  } | null
  stats: {
    total: number
    active: number
    pending: number
    suspended: number
  } | null
}

// État initial
const initialState: UserState = {
  sellers: [],
  currentUser: null,
  sellersStatus: LoadingType.IDLE,
  currentUserStatus: LoadingType.IDLE,
  reportStatus: LoadingType.IDLE,
  error: null,
  pagination: null,
  stats: null,
}

// Helper pour extraire le message d'erreur
const getErrorMessage = (action: any): string => {
  return action.payload?.message || action.error?.message || 'Une erreur est survenue'
}

// Slice (simplifié - sans fonctionnalités admin)
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Réinitialiser l'état
    resetUserState: (state) => {
      state.sellers = []
      state.currentUser = null
      state.sellersStatus = LoadingType.IDLE
      state.currentUserStatus = LoadingType.IDLE
      state.reportStatus = LoadingType.IDLE
      state.error = null
      state.pagination = null
      state.stats = null
    },
    // Réinitialiser le statut de signalement
    resetReportStatus: (state) => {
      state.reportStatus = LoadingType.IDLE
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch public sellers - Endpoint public
      .addCase(fetchPublicSellersAction.pending, (state) => {
        state.sellersStatus = LoadingType.PENDING
        state.error = null
      })
      .addCase(
        fetchPublicSellersAction.fulfilled,
        (state, action: PayloadAction<UserListResponse>) => {
          state.sellersStatus = LoadingType.SUCCESS
          state.sellers = action.payload.users
          state.pagination = action.payload.pagination
          state.stats = action.payload.stats
        }
      )
      .addCase(fetchPublicSellersAction.rejected, (state, action) => {
        state.sellersStatus = LoadingType.FAILED
        state.error = getErrorMessage(action)
      })
      // ✅ Fetch user by ID - Endpoint public
      .addCase(fetchUserByIdAction.pending, (state) => {
        state.currentUserStatus = LoadingType.PENDING
        state.error = null
      })
      .addCase(
        fetchUserByIdAction.fulfilled,
        (state, action: PayloadAction<AuthUser>) => {
          state.currentUserStatus = LoadingType.SUCCESS
          state.currentUser = action.payload
        }
      )
      .addCase(fetchUserByIdAction.rejected, (state, action) => {
        state.currentUserStatus = LoadingType.FAILED
        state.error = getErrorMessage(action)
      })
      // ✅ Report user - Auth requise
      .addCase(reportUserAction.pending, (state) => {
        state.reportStatus = LoadingType.PENDING
        state.error = null
      })
      .addCase(reportUserAction.fulfilled, (state) => {
        state.reportStatus = LoadingType.SUCCESS
      })
      .addCase(reportUserAction.rejected, (state, action) => {
        state.reportStatus = LoadingType.FAILED
        state.error = getErrorMessage(action)
      })
  },
})

// Actions
export const { resetUserState, resetReportStatus } = userSlice.actions

// Selectors
export const selectSellers = (state: RootState) => state.user.sellers
export const selectCurrentUser = (state: RootState) => state.user.currentUser
export const selectSellersStatus = (state: RootState) => state.user.sellersStatus
export const selectCurrentUserStatus = (state: RootState) => state.user.currentUserStatus
export const selectReportStatus = (state: RootState) => state.user.reportStatus
export const selectUserError = (state: RootState) => state.user.error
export const selectUserPagination = (state: RootState) => state.user.pagination
export const selectUserStats = (state: RootState) => state.user.stats

export default userSlice
