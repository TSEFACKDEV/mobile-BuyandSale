import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import type { AuthUser } from '../../models/user'
import { LoadingType, type AsyncState } from '../../models/store'
import {
  fetchPublicSellersAction,
  fetchUserByIdAction,
  reportUserAction,
  type UserListResponse,
} from './actions'

interface UserStats {
  total: number
  active: number
  pending: number
  suspended: number
}

interface UserState {
  users: AsyncState<AuthUser[]>
  currentUser: AsyncState<AuthUser | null>
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    perpage: number
    prevPage: number | null
    currentPage: number
    nextPage: number | null
    totalPage: number
  } | null
  stats: UserStats | null
}

const initialState: UserState = {
  users: {
    entities: [],
    status: LoadingType.IDLE,
    error: null,
    pagination: null,
  },
  currentUser: {
    entities: null,
    status: LoadingType.IDLE,
    error: null,
    pagination: null,
  },
  pagination: null,
  stats: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    resetUserState: (state) => {
      state.users = {
        entities: [],
        status: LoadingType.IDLE,
        error: null,
        pagination: null,
      }
      state.currentUser = {
        entities: null,
        status: LoadingType.IDLE,
        error: null,
        pagination: null,
      }
      state.pagination = null
      state.stats = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPublicSellersAction
      .addCase(fetchPublicSellersAction.pending, (state) => {
        state.users.status = LoadingType.PENDING
        state.users.error = null
      })
      .addCase(fetchPublicSellersAction.fulfilled, (state, action) => {
        state.users.status = LoadingType.SUCCESS
        state.users.entities = action.payload.users
        state.pagination = action.payload.pagination
        state.stats = action.payload.stats
      })
      .addCase(fetchPublicSellersAction.rejected, (state, action) => {
        state.users.status = LoadingType.FAILED
        state.users.error = {
          meta: {
            status: 500,
            message: action.payload?.message || action.error?.message || 'Une erreur est survenue',
          },
          error: action.error?.message || null,
        }
      })
      // fetchUserByIdAction
      .addCase(fetchUserByIdAction.pending, (state) => {
        state.currentUser.status = LoadingType.PENDING
        state.currentUser.error = null
      })
      .addCase(fetchUserByIdAction.fulfilled, (state, action) => {
        state.currentUser.status = LoadingType.SUCCESS
        state.currentUser.entities = action.payload
      })
      .addCase(fetchUserByIdAction.rejected, (state, action) => {
        state.currentUser.status = LoadingType.FAILED
        state.currentUser.error = {
          meta: {
            status: 500,
            message: action.payload?.message || action.error?.message || 'Une erreur est survenue',
          },
          error: action.error?.message || null,
        }
      })
      // reportUserAction
      .addCase(reportUserAction.pending, () => {})
      .addCase(reportUserAction.fulfilled, () => {})
      .addCase(reportUserAction.rejected, () => {})
  },
})

// Sélecteurs
export const selectUsersState = (state: RootState) => state.user.users
export const selectUsers = (state: RootState) => state.user.users.entities
export const selectUsersStatus = (state: RootState) => state.user.users.status
export const selectUsersError = (state: RootState) => state.user.users.error
export const selectUserStats = (state: RootState) => state.user.stats

export const selectCurrentUser = (state: RootState) => state.user.currentUser.entities
export const selectCurrentUserStatus = (state: RootState) => state.user.currentUser.status
export const selectCurrentUserError = (state: RootState) => state.user.currentUser.error

export const selectUserById = (userId: string) => (state: RootState) =>
  state.user.users.entities.find((user) => user.id === userId)

export const { resetUserState } = userSlice.actions
export default userSlice
