import { createAsyncThunk } from '@reduxjs/toolkit';
import type { ThunkApi } from '../../models/store';
import type { ApiResponse } from '../../models/base';
import type { HeroBanner } from '../../types/heroBanner.types';
import API_CONFIG from '../../config/api.config';

/**
 * Récupérer uniquement les bannières actives (Public)
 */
export const getActiveHeroBannersAction = createAsyncThunk<
  HeroBanner[],
  void,
  ThunkApi
>('heroBanner/getActive', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/hero-banners/active`);
    const data: ApiResponse<HeroBanner[]> = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.meta?.message || 'Erreur lors de la récupération des bannières actives'
      );
    }

    return data.data as HeroBanner[];
  } catch (error: unknown) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
});
