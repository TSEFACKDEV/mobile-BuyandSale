import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getAllCategoriesAction } from './actions'
import { LoadingType } from '../../models/store'
import type { RootState } from '../index'

// Interface pour une catégorie - correspond aux données backend EXACTES
export interface Category {
  id: string
  name: string
  description?: string | null
  productCount?: number
  createdAt: string
  updatedAt: string
}

// Interface pour l'état du slice (simplifié - pas de CRUD admin)
export interface CategoryState {
  data: Category[]
  status: LoadingType
  error: string | null
}

// État initial
const initialState: CategoryState = {
  data: [],
  status: LoadingType.IDLE,
  error: null,
}

// Helper pour extraire le message d'erreur
const getErrorMessage = (action: any): string => {
  return action.payload?.message || action.error?.message || 'Une erreur est survenue'
}

// Slice (simplifié - sans fonctionnalités admin)
export const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    // Réinitialiser l'état
    resetCategoryState: (state) => {
      state.status = LoadingType.IDLE
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Get all categories - Endpoint public
      .addCase(getAllCategoriesAction.pending, (state) => {
        state.status = LoadingType.PENDING
        state.error = null
      })
      .addCase(
        getAllCategoriesAction.fulfilled,
        (
          state,
          action: PayloadAction<{
            categories: Category[]
            pagination?: {
              total: number
              page: number
              limit: number
              totalPages: number
            }
          }>
        ) => {
          state.status = LoadingType.SUCCESS
          state.data = action.payload.categories
        }
      )
      .addCase(getAllCategoriesAction.rejected, (state, action) => {
        state.status = LoadingType.FAILED
        state.error = getErrorMessage(action)
      })
  },
})

// Actions
export const { resetCategoryState } = categorySlice.actions

// Selectors
export const selectCategories = (state: RootState) => state.category.data
export const selectCategoriesStatus = (state: RootState) => state.category.status
export const selectCategoriesError = (state: RootState) => state.category.error

export default categorySlice
