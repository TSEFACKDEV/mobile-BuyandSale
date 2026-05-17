import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { LoadingType } from '../../models/store';
import type { HeroBanner } from '../../types/heroBanner.types';
import { getActiveHeroBannersAction } from './actions';

export interface HeroBannerState {
  activeBanners: HeroBanner[];
  status: LoadingType;
  error: string | null;
}

const initialState: HeroBannerState = {
  activeBanners: [],
  status: LoadingType.IDLE,
  error: null,
};

const heroBannerSlice = createSlice({
  name: 'heroBanner',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getActiveHeroBannersAction.pending, (state) => {
        state.status = LoadingType.PENDING;
        state.error = null;
      })
      .addCase(getActiveHeroBannersAction.fulfilled, (state, action) => {
        state.status = LoadingType.SUCCESS;
        state.activeBanners = action.payload;
      })
      .addCase(getActiveHeroBannersAction.rejected, (state, action: any) => {
        state.status = LoadingType.FAILED;
        state.error = action.payload?.message || 'Erreur inconnue';
      });
  },
});

export const selectActiveBanners = (state: RootState) =>
  state.heroBanner.activeBanners;

export default heroBannerSlice;
