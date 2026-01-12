import { createSlice } from '@reduxjs/toolkit'
import { LoadingType, type AsyncState } from '../../models/store'
import type { RootState } from '..'
import { registerAction, verifyOtpAction, resendOtpAction } from './actions'
import { getErrorMessage } from '../../utils/errorHelpers'
import type { RegisterResponse } from '../../models/user'

type RegisterState = {
  register: AsyncState<RegisterResponse | null>
  otpVerification: AsyncState<{ message: string } | null>
  resendOtp: AsyncState<{ message: string; method?: string; contact?: string } | null>
}

const initialState: RegisterState = {
  register: {
    entities: null,
    pagination: null,
    status: LoadingType.IDLE,
    error: null,
  },
  otpVerification: {
    entities: null,
    pagination: null,
    status: LoadingType.IDLE,
    error: null,
  },
  resendOtp: {
    entities: null,
    pagination: null,
    status: LoadingType.IDLE,
    error: null,
  },
}

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    resetRegisterStatus: (state) => {
      state.register.status = LoadingType.IDLE
      state.register.error = null
    },
    resetOtpVerificationStatus: (state) => {
      state.otpVerification.status = LoadingType.IDLE
      state.otpVerification.error = null
    },
    resetResendOtpStatus: (state) => {
      state.resendOtp.status = LoadingType.IDLE
      state.resendOtp.error = null
    },
    clearRegisterData: (state) => {
      state.register.entities = null
      state.register.status = LoadingType.IDLE
      state.register.error = null
      state.otpVerification.entities = null
      state.otpVerification.status = LoadingType.IDLE
      state.otpVerification.error = null
      state.resendOtp.entities = null
      state.resendOtp.status = LoadingType.IDLE
      state.resendOtp.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // 📝 INSCRIPTION
      .addCase(registerAction.pending, (state) => {
        state.register.entities = null
        state.register.error = null
        state.register.status = LoadingType.PENDING
      })
      .addCase(registerAction.fulfilled, (state, action) => {
        state.register.status = LoadingType.SUCCESS
        if (action.payload && action.payload.data) {
          state.register.entities = action.payload.data
        }
        state.register.error = null
      })
      .addCase(registerAction.rejected, (state, action) => {
        const errorMessage = getErrorMessage(action)
        state.register.error = {
          meta: { status: 400, message: errorMessage },
          error: null,
        }
        state.register.status = LoadingType.FAILED
      })

      // 🔐 VÉRIFICATION OTP
      .addCase(verifyOtpAction.pending, (state) => {
        state.otpVerification.entities = null
        state.otpVerification.error = null
        state.otpVerification.status = LoadingType.PENDING
      })
      .addCase(verifyOtpAction.fulfilled, (state, action) => {
        state.otpVerification.status = LoadingType.SUCCESS
        if (action.payload && action.payload.data) {
          state.otpVerification.entities = action.payload.data
        }
        state.otpVerification.error = null
      })
      .addCase(verifyOtpAction.rejected, (state, action) => {
        const errorMessage = getErrorMessage(action)
        state.otpVerification.error = {
          meta: { status: 400, message: errorMessage },
          error: null,
        }
        state.otpVerification.status = LoadingType.FAILED
      })

      // 🔄 RENVOI OTP
      .addCase(resendOtpAction.pending, (state) => {
        state.resendOtp.entities = null
        state.resendOtp.error = null
        state.resendOtp.status = LoadingType.PENDING
      })
      .addCase(resendOtpAction.fulfilled, (state, action) => {
        state.resendOtp.status = LoadingType.SUCCESS
        if (action.payload && action.payload.data) {
          state.resendOtp.entities = action.payload.data
        }
        state.resendOtp.error = null
      })
      .addCase(resendOtpAction.rejected, (state, action) => {
        const errorMessage = getErrorMessage(action)
        state.resendOtp.error = {
          meta: { status: 400, message: errorMessage },
          error: null,
        }
        state.resendOtp.status = LoadingType.FAILED
      })
  },
})

// 🎯 Export des actions
export const {
  resetRegisterStatus,
  resetOtpVerificationStatus,
  resetResendOtpStatus,
  clearRegisterData,
} = registerSlice.actions

// 🎯 Selectors
export const selectUserRegisted = (state: RootState) => state.register.register
export const selectOtpVerification = (state: RootState) => state.register.otpVerification
export const selectResendOtp = (state: RootState) => state.register.resendOtp

// 🎯 Export du reducer
export default registerSlice.reducer
