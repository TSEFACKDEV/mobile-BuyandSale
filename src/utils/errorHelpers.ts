import { SerializedError } from '@reduxjs/toolkit';

export const getErrorMessage = (
  action: { payload: any; error?: SerializedError } | any
): string => {
  // Si payload contient un message
  if (action.payload?.message) {
    return action.payload.message;
  }

  // Si error contient un message
  if (action.error?.message) {
    return action.error.message;
  }

  // Message par défaut
  return 'Une erreur est survenue';
};
