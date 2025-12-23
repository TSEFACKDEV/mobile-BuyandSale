import { createAsyncThunk } from '@reduxjs/toolkit'
import type { ThunkApi } from '../../models/store'
import type { Category } from './slice'
import API_CONFIG from '../../config/api.config'

// Interface pour les paramètres de recherche et pagination
interface CategoryFetchParams {
  page?: number
  limit?: number
  search?: string
}

// ✅ Get all categories (Public - Pas d'auth requise)
export const getAllCategoriesAction = createAsyncThunk<
  {
    categories: Category[]
    pagination?: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  },
  CategoryFetchParams | void,
  ThunkApi
>('category/getAll', async (params, { rejectWithValue }) => {
  try {
    // Construction des paramètres de requête
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)

    const queryString = queryParams.toString()
    const url = queryString
      ? `${API_CONFIG.BASE_URL}/category?${queryString}`
      : `${API_CONFIG.BASE_URL}/category`

    const response = await fetch(url)

    if (!response.ok) {
      const data = await response
        .json()
        .catch(() => ({ message: 'Erreur de serveur' }))

      switch (response.status) {
        case 400:
          throw new Error(data.message || 'Paramètres invalides')
        case 500:
          throw new Error('Erreur serveur lors de la récupération des catégories')
        default:
          throw new Error('Erreur lors de la récupération des catégories')
      }
    }

    const data = await response.json()

    // Backend renvoie { success: true, message: "...", data: { categories: [...], pagination: {...} } }
    return data.data
  } catch (error: unknown) {
    return rejectWithValue({
      message:
        (error as Error).message ||
        'Erreur lors de la récupération des catégories',
    })
  }
})
