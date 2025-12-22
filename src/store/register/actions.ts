import { createAsyncThunk } from '@reduxjs/toolkit'
import API_ENDPOINTS from '../../helpers/api'
import type { ThunkApi } from '../../models/store'
import type { ApiResponse } from '../../models/base'
import type { UserRegisterForm, RegisterResponse, OtpVerificationForm, AuthUser } from '../../models/user'
import { API_CONFIG } from '../../config/api.config'

/**
 * 📝 ACTION D'INSCRIPTION
 * Correspond exactement au endpoint POST /auth/register du backend
 */
export const registerAction = createAsyncThunk<
  ApiResponse<RegisterResponse>,
  UserRegisterForm,
  ThunkApi
>('auth/register', async (args, apiThunk) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_REGISTER}`,
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
      const errorMessage = data?.message || 'Erreur lors de l\'inscription'
      throw new Error(errorMessage)
    }

    return data
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Une erreur s\'est produite lors de l\'inscription'
    return apiThunk.rejectWithValue({
      message: errorMessage,
    })
  }
})

/**
 * 🔐 ACTION DE VÉRIFICATION OTP
 * Correspond exactement au endpoint POST /auth/verify-otp du backend
 * Retourne l'utilisateur vérifié (pas de token, il faut se reconnecter après)
 */
export const verifyOtpAction = createAsyncThunk<
  ApiResponse<{ message: string }>,
  OtpVerificationForm,
  ThunkApi
>('auth/verify-otp', async (args, apiThunk) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_VERIFY_OTP}`,
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
      const errorMessage = data?.meta?.message || data?.message || 'Erreur de vérification OTP'
      throw new Error(errorMessage)
    }

    return data
  } catch (error: unknown) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Une erreur s\'est produite lors de la vérification OTP'
    return apiThunk.rejectWithValue({
      message: errorMessage,
    })
  }
})

/**
 * 🔄 ACTION DE RENVOI OTP
 * Envoie une demande de nouveau code OTP au backend
 */
export const resendOtpAction = createAsyncThunk<
  ApiResponse<{ message: string }>,
  { userId: string },
  ThunkApi
>('auth/resend-otp', async (args, apiThunk) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_RESEND_OTP}`,
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
      const errorMessage = data?.meta?.message || data?.message || 'Échec du renvoi OTP'
      throw new Error(errorMessage)
    }

    return data
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erreur lors du renvoi OTP'
    return apiThunk.rejectWithValue({ 
      message: errorMessage 
    })
  }
})

