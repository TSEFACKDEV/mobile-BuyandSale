import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import {
  getSellerProductsAction,
  getUserProductsAction,
  getMyPendingProductsAction,
  deleteProductAction,
} from '../store/product/actions';
import {
  selectSellerProducts,
  selectSellerProductsStatus,
  selectCurrentSeller,
  selectUserProducts,
  selectUserProductsStatus,
  selectUserPagination,
  selectMyPendingProducts,
  selectMyPendingProductsStatus,
} from '../store/product/slice';

export interface ProductParams {
  sellerId?: string;
  userId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface UseProductsOptions {
  autoFetch?: boolean;
}

export const useProducts = (
  context: "seller" | "user" | "pending",
  params?: ProductParams,
  options: UseProductsOptions = { autoFetch: true }
) => {
  const dispatch = useAppDispatch();
  const loadedParamsRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  // Select appropriate Redux state based on context
  const sellerProducts = useAppSelector(selectSellerProducts);
  const sellerStatus = useAppSelector(selectSellerProductsStatus);
  const sellerMetadata = useAppSelector(selectCurrentSeller);

  const userProducts = useAppSelector(selectUserProducts);
  const userStatus = useAppSelector(selectUserProductsStatus);
  const userMetadata = useAppSelector(selectUserPagination);

  const pendingProducts = useAppSelector(selectMyPendingProducts);
  const pendingStatus = useAppSelector(selectMyPendingProductsStatus);

  // Determine which products/status/metadata to use
  const products = context === 'seller' 
    ? sellerProducts 
    : context === 'user' 
      ? userProducts 
      : pendingProducts;
  
  const status = context === 'seller' 
    ? sellerStatus 
    : context === 'user' 
      ? userStatus 
      : pendingStatus;
  
  const metadata = context === 'seller' 
    ? sellerMetadata 
    : context === 'user' 
      ? userMetadata 
      : null;

  // Loading state
  const isLoading = status === 'loading';

  // Fetch function
  const fetchProducts = useCallback(() => {
    if (isLoadingRef.current) return;

    const paramsKey = JSON.stringify({ context, params });
    if (loadedParamsRef.current === paramsKey) return;

    // Validate required params per context
    if (context === 'seller' && !params?.sellerId) return;
    if (context === 'user' && !params?.userId) return;

    loadedParamsRef.current = paramsKey;
    isLoadingRef.current = true;

    let actionPromise;
    
    switch (context) {
      case 'seller':
        actionPromise = dispatch(
          getSellerProductsAction({
            sellerId: params!.sellerId!,
            page: params?.page,
            limit: params?.limit,
            search: params?.search,
          })
        );
        break;
      
      case 'user':
        actionPromise = dispatch(
          getUserProductsAction({
            userId: params!.userId!,
            page: params?.page,
            limit: params?.limit,
            search: params?.search,
          })
        );
        break;
      
      case 'pending':
        actionPromise = dispatch(getMyPendingProductsAction());
        break;
      
      default:
        isLoadingRef.current = false;
        return;
    }

    actionPromise.finally(() => {
      isLoadingRef.current = false;
    });
  }, [context, params, dispatch]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (options.autoFetch) {
      fetchProducts();
    }
  }, [fetchProducts, options.autoFetch]);

  // Refetch function
  const refetch = useCallback(() => {
    loadedParamsRef.current = null;
    fetchProducts();
  }, [fetchProducts]);

  // Delete product function
  const deleteProduct = useCallback(async (productId: string) => {
    return dispatch(deleteProductAction(productId)).unwrap();
  }, [dispatch]);

  return {
    products,
    metadata,
    isLoading,
    refetch,
    deleteProduct,
  };
};
