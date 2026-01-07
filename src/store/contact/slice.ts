import { createSlice } from '@reduxjs/toolkit';
import { createContactAction, ContactResponse } from './actions';

// ===============================
// LOADING STATES
// ===============================

export enum LoadingType {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

// ===============================
// STATE INTERFACE
// ===============================

export interface ContactState {
  status: LoadingType;
  error: string | null;
  success: boolean;
  lastContact: ContactResponse | null;
}

// ===============================
// INITIAL STATE
// ===============================

const initialState: ContactState = {
  status: LoadingType.IDLE,
  error: null,
  success: false,
  lastContact: null,
};

// ===============================
// SLICE
// ===============================

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    // Réinitialiser l'état après succès (utile pour fermer modal)
    resetContactState: (state) => {
      state.status = LoadingType.IDLE;
      state.error = null;
      state.success = false;
    },
    // Réinitialiser uniquement l'erreur
    clearContactError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ===============================
    // CREATE CONTACT
    // ===============================
    builder
      .addCase(createContactAction.pending, (state) => {
        state.status = LoadingType.LOADING;
        state.error = null;
        state.success = false;
      })
      .addCase(createContactAction.fulfilled, (state, action) => {
        state.status = LoadingType.SUCCEEDED;
        state.success = true;
        state.lastContact = action.payload;
        state.error = null;
      })
      .addCase(createContactAction.rejected, (state, action) => {
        state.status = LoadingType.FAILED;
        state.error = action.payload?.message || "Échec de l'envoi du message";
        state.success = false;
      });
  },
});

export const { resetContactState, clearContactError } = contactSlice.actions;

// ===============================
// SELECTORS
// ===============================

export const selectContactStatus = (state: { contact: ContactState }) => state.contact.status;
export const selectContactError = (state: { contact: ContactState }) => state.contact.error;
export const selectContactSuccess = (state: { contact: ContactState }) => state.contact.success;
export const selectLastContact = (state: { contact: ContactState }) => state.contact.lastContact;

export default contactSlice.reducer;
