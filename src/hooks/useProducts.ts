import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import {
  getSellerProductsAction,
} from '../store/product/actions';
import {
  selectSellerProducts,
  selectSellerProductsStatus,
  selectCurrentSeller,
} from '../store/product/slice';

export interface ProductParams {
  sellerId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const useProducts = (
  context: "seller",
  params?: ProductParams
) => {
  const dispatch = useAppDispatch();
  const loadedParamsRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  // Redux state
  const products = useAppSelector(selectSellerProducts);
  const status = useAppSelector(selectSellerProductsStatus);
  const metadata = useAppSelector(selectCurrentSeller);

  // Loading state
  const isLoading = status === 'loading';

  // Fetch function
  const fetchProducts = useCallback(() => {
    if (!params?.sellerId || isLoadingRef.current) return;

    const paramsKey = JSON.stringify({ context, params });
    if (loadedParamsRef.current === paramsKey) return;

    loadedParamsRef.current = paramsKey;
    isLoadingRef.current = true;

    dispatch(
      getSellerProductsAction({
        sellerId: params.sellerId,
        page: params.page,
        limit: params.limit,
        search: params.search,
      })
    ).finally(() => {
      isLoadingRef.current = false;
    });
  }, [context, params, dispatch]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Refetch function
  const refetch = useCallback(() => {
    loadedParamsRef.current = null;
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    metadata,
    isLoading,
    refetch,
  };
};
