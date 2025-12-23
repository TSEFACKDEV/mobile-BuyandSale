import { createAsyncThunk } from '@reduxjs/toolkit'
import type { ThunkApi } from '../../models/store'
import type { City } from './slice'
import API_CONFIG from '../../config/api.config'

// Interface pour les paramètres de recherche cities
interface CityFetchArgs {
  search?: string
}

// ✅ Fetch cities with search parameters (Public - Pas d'auth requise)
export const fetchCitiesAction = createAsyncThunk<
  City[],
  CityFetchArgs | void,
  ThunkApi
>('city/fetchWithSearch', async (args, apiThunk) => {
  try {
    // Validation côté client
    if (args?.search && args.search.trim().length === 0) {
      throw new Error('Terme de recherche vide')
    }

    // Construire les paramètres de requête
    const params = new URLSearchParams()

    if (args?.search && args.search.trim()) {
      params.append('search', args.search.trim())
    }

    const queryString = params.toString()
    const url = `${API_CONFIG.BASE_URL}/city${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url)

    if (!response.ok) {
      // Gestion d'erreur selon le status code
      const data = await response
        .json()
        .catch(() => ({ message: 'Erreur de serveur' }))

      switch (response.status) {
        case 400:
          throw new Error(data.message || 'Paramètres de recherche invalides')
        case 500:
          throw new Error('Erreur serveur lors de la recherche de villes')
        default:
          throw new Error('Erreur lors de la récupération des villes')
      }
    }

    const data = await response.json()
    return data.data
  } catch (error: unknown) {
    return apiThunk.rejectWithValue({
      message:
        (error as Error).message || 'Erreur lors de la récupération des villes',
    })
  }
})
