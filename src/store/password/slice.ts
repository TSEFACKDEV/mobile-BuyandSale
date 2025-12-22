import { createSlice } from '@reduxjs/toolkit'
import { LoadingType, type AsyncState } from '../../models/store'
import type { RootState } from '..'
import { forgotPasswordAction, resetPasswordAction } from './actions'
import { getErrorMessage } from '../../utils/errorHelpers'

type PasswordState = {
  forgotPassword: AsyncState<Record<string, never> | null>
  resetPassword: AsyncState<{ id: string; message: string } | null>
}

const initialState: PasswordState = {
  forgotPassword: {
    entities: null,
    pagination: null,
    status: LoadingType.IDLE,
    error: null,
  },
  resetPassword: {
    entities: null,
    pagination: null,
    status: LoadingType.IDLE,
    error: null,
  },
}

const passwordSlice = createSlice({
  name: 'password',
  initialState,
  reducers: {
    resetForgotPasswordStatus: (state) => {
      state.forgotPassword.status = LoadingType.IDLE
      state.forgotPassword.error = null
    },
    resetResetPasswordStatus: (state) => {
      state.resetPassword.status = LoadingType.IDLE
      state.resetPassword.error = null
    },
    clearPasswordData: (state) => {
      state.forgotPassword.entities = null
      state.forgotPassword.status = LoadingType.IDLE
      state.forgotPassword.error = null
      state.resetPassword.entities = null
      state.resetPassword.status = LoadingType.IDLE
      state.resetPassword.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔑 MOT DE PASSE OUBLIÉ
      .addCase(forgotPasswordAction.pending, (state) => {
        state.forgotPassword.entities = null
        state.forgotPassword.error = null
        state.forgotPassword.status = LoadingType.PENDING
      })
      .addCase(forgotPasswordAction.fulfilled, (state, action) => {
        state.forgotPassword.status = LoadingType.SUCCESS
        if (action.payload && action.payload.data) {
          state.forgotPassword.entities = action.payload.data
        }
        state.forgotPassword.error = null
      })
      .addCase(forgotPasswordAction.rejected, (state, action) => {
        const errorMessage = getErrorMessage(action)
        state.forgotPassword.error = {
          meta: { status: 400, message: errorMessage },
          error: null,
        }
        state.forgotPassword.status = LoadingType.FAILED
      })

      // 🔄 RÉINITIALISATION MOT DE PASSE
      .addCase(resetPasswordAction.pending, (state) => {
        state.resetPassword.entities = null
        state.resetPassword.error = null
        state.resetPassword.status = LoadingType.PENDING
      })
      .addCase(resetPasswordAction.fulfilled, (state, action) => {
        state.resetPassword.status = LoadingType.SUCCESS
        if (action.payload && action.payload.data) {
          state.resetPassword.entities = action.payload.data
        }
        state.resetPassword.error = null
      })
      .addCase(resetPasswordAction.rejected, (state, action) => {
        const errorMessage = getErrorMessage(action)
        state.resetPassword.error = {
          meta: { status: 400, message: errorMessage },
          error: null,
        }
        state.resetPassword.status = LoadingType.FAILED
      })
  },
})

// 🎯 Export des actions
export const {
  resetForgotPasswordStatus,
  resetResetPasswordStatus,
  clearPasswordData,
} = passwordSlice.actions

// 🎯 Selectors
export const selectForgotPassword = (state: RootState) => state.password.forgotPassword
export const selectResetPassword = (state: RootState) => state.password.resetPassword

// 🎯 Export du reducer
export default passwordSlice.reducer
