import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { fetchCitiesAction } from './actions'
import { LoadingType } from '../../models/store'
import type { RootState } from '../index'

// Interface pour une ville - correspond aux données backend EXACTES
export interface City {
  id: string
  name: string
  slug?: string // Slug SEO-friendly
  userCount?: number
  productCount?: number
  createdAt: string
  updatedAt: string
}

// Interface pour l'état du slice (simplifié - pas de CRUD admin)
export interface CityState {
  data: City[]
  status: LoadingType
  error: string | null
}

// État initial
const initialState: CityState = {
  data: [],
  status: LoadingType.IDLE,
  error: null,
}

// Helper pour extraire le message d'erreur
const getErrorMessage = (action: any): string => {
  return action.payload?.message || action.error?.message || 'Une erreur est survenue'
}

// Slice (simplifié - sans fonctionnalités admin)
export const citySlice = createSlice({
  name: 'city',
  initialState,
  reducers: {
    // Réinitialiser l'état
    resetCityState: (state) => {
      state.status = LoadingType.IDLE
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch cities (avec/sans search) - Endpoint public
      .addCase(fetchCitiesAction.pending, (state) => {
        state.status = LoadingType.PENDING
        state.error = null
      })
      .addCase(
        fetchCitiesAction.fulfilled,
        (state, action: PayloadAction<City[]>) => {
          state.status = LoadingType.SUCCESS
          state.data = action.payload
        }
      )
      .addCase(fetchCitiesAction.rejected, (state, action) => {
        state.status = LoadingType.FAILED
        state.error = getErrorMessage(action)
      })
  },
})

// Actions
export const { resetCityState } = citySlice.actions

// Selectors
export const selectCities = (state: RootState) => state.city.data
export const selectCitiesStatus = (state: RootState) => state.city.status
export const selectCitiesError = (state: RootState) => state.city.error

export default citySlice
