import { createAsyncThunk } from '@reduxjs/toolkit'
import type { ThunkApi } from '../../models/store'
import API_CONFIG from '../../config/api.config'
import fetchWithAuth from '../../utils/fetchWithAuth'

// Interface pour un utilisateur
export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string | null
  role?: {
    id: string
    name: string
  }
  city?: {
    id: string
    name: string
  }
  status?: 'ACTIVE' | 'PENDING' | 'SUSPENDED'
  slug?: string
  isVerified?: boolean
  createdAt: string
  updatedAt: string
  // Statistiques vendeur
  productCount?: number
  averageRating?: number
  totalReviews?: number
}

// Interface pour la réponse de liste d'utilisateurs
export interface UserListResponse {
  users: AuthUser[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  stats: {
    total: number
    active: number
    pending: number
    suspended: number
  }
}

// Interface pour les paramètres de recherche vendeurs publics
interface PublicSellersParams {
  search?: string
  page?: number
  limit?: number
}

// ✅ Fetch public sellers (Public - Pas d'auth requise)
// Cette action récupère la liste des vendeurs publics pour l'affichage
export const fetchPublicSellersAction = createAsyncThunk<
  UserListResponse,
  PublicSellersParams,
  ThunkApi
>('user/fetchPublicSellers', async (params, { rejectWithValue }) => {
  try {
    const { search, page = 1, limit = 12 } = params

    // Construction de l'URL avec paramètres
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (search && search.trim()) {
      searchParams.append('search', search.trim())
    }

    const url = `${API_CONFIG.BASE_URL}/user/public-sellers?${searchParams}`

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-type': 'application/json' },
    })

    if (!response.ok) {
      const data = await response
        .json()
        .catch(() => ({ message: 'Erreur de serveur' }))

      switch (response.status) {
        case 400:
          throw new Error(data.message || 'Paramètres invalides')
        case 500:
          throw new Error('Erreur serveur lors de la récupération des vendeurs')
        default:
          throw new Error('Erreur lors de la récupération des vendeurs')
      }
    }

    const data = await response.json()
    return data.data
  } catch (error: unknown) {
    return rejectWithValue({
      message:
        (error as Error).message ||
        'Erreur lors de la récupération des vendeurs',
    })
  }
})

// ✅ Fetch user by ID or slug (Public - Pas d'auth requise)
// Cette action récupère les détails d'un vendeur spécifique
export const fetchUserByIdAction = createAsyncThunk<
  AuthUser,
  string,
  ThunkApi
>('user/fetchById', async (userId, { rejectWithValue }) => {
  try {
    const url = `${API_CONFIG.BASE_URL}/user/seller/${userId}`

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-type': 'application/json' },
    })

    if (!response.ok) {
      const data = await response
        .json()
        .catch(() => ({ message: 'Erreur de serveur' }))

      switch (response.status) {
        case 404:
          throw new Error('Vendeur non trouvé')
        case 500:
          throw new Error('Erreur serveur lors de la récupération du vendeur')
        default:
          throw new Error('Erreur lors de la récupération du vendeur')
      }
    }

    const data = await response.json()
    return data.data
  } catch (error: unknown) {
    return rejectWithValue({
      message:
        (error as Error).message ||
        'Erreur lors de la récupération du vendeur',
    })
  }
})

// ✅ Report user (Auth requise)
// Signaler un utilisateur - nécessite authentification
export const reportUserAction = createAsyncThunk<
  { message: string },
  { id: string; reason: string; details?: string },
  ThunkApi
>('user/report', async ({ id, reason, details }, { rejectWithValue }) => {
  try {
    const url = `${API_CONFIG.BASE_URL}/user/report/${id}`

    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify({ reason, details }),
    })

    if (!response.ok) {
      const data = await response
        .json()
        .catch(() => ({ message: 'Erreur de serveur' }))

      switch (response.status) {
        case 401:
          throw new Error('Authentification requise')
        case 404:
          throw new Error('Utilisateur non trouvé')
        case 400:
          throw new Error(data.message || 'Données invalides')
        case 500:
          throw new Error('Erreur serveur lors du signalement')
        default:
          throw new Error('Erreur lors du signalement')
      }
    }

    const data = await response.json()
    return data.data
  } catch (error: unknown) {
    return rejectWithValue({
      message:
        (error as Error).message || 'Erreur lors du signalement',
    })
  }
})
