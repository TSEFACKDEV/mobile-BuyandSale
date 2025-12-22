import { createAsyncThunk } from '@reduxjs/toolkit'
import API_ENDPOINTS from '../../helpers/api'
import type { ThunkApi } from '../../models/store'
import type { ApiResponse } from '../../models/base'
import type { ForgotPasswordForm, ResetPasswordForm } from '../../models/user'
import { API_CONFIG } from '../../config/api.config'

/**
 * 🔑 ACTION MOT DE PASSE OUBLIÉ
 * Correspond exactement au endpoint POST /auth/forgot-password du backend
 */
export const forgotPasswordAction = createAsyncThunk<
  ApiResponse<Record<string, never>>,
  ForgotPasswordForm,
  ThunkApi
>('auth/forgot-password', async (args, apiThunk) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_FORGOT_PASSWORD}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
      }
    )
    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data?.meta?.message || data?.message || 'Échec de l\'envoi de l\'email'
      throw new Error(errorMessage)
    }

    return data
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Une erreur s\'est produite lors de la demande de réinitialisation'
    return apiThunk.rejectWithValue({
      message: errorMessage,
    })
  }
})

/**
 * 🔄 ACTION RÉINITIALISATION MOT DE PASSE
 * Correspond exactement au endpoint POST /auth/reset-password du backend
 */
export const resetPasswordAction = createAsyncThunk<
  ApiResponse<{ id: string; message: string }>,
  ResetPasswordForm,
  ThunkApi
>('auth/reset-password', async (args, apiThunk) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_RESET_PASSWORD}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
      }
    )
    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data?.meta?.message || data?.message || 'Échec de la réinitialisation'
      throw new Error(errorMessage)
    }

    return data
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Une erreur s\'est produite lors de la réinitialisation'
    return apiThunk.rejectWithValue({
      message: errorMessage,
    })
  }
})
