import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import {
  getSellerReviewsAction,
  getMyReviewsAction,
} from '../store/review/actions';
import { selectUserRatingStats } from '../store/review/slice';

/**
 * Hook personnalisé pour gérer les reviews d'un vendeur
 * EXACTEMENT comme React - évite la duplication de logique
 * 
 * @param sellerId - ID du vendeur
 * @param shouldLoadMyReviews - Charger également les reviews de l'utilisateur connecté
 * @returns Les statistiques de rating du vendeur
 */
export const useSellerReviews = (
  sellerId: string | undefined,
  shouldLoadMyReviews: boolean = false
) => {
  const dispatch = useAppDispatch();
  const loadingRef = useRef(false);
  const lastLoadedSellerRef = useRef<string | undefined>(undefined);

  // Utiliser le sélecteur mémorisé
  const ratingStats = useAppSelector(selectUserRatingStats);

  // Fonction de chargement avec protection contre les appels multiples
  const loadReviewsData = useCallback(async () => {
    if (
      !sellerId ||
      loadingRef.current ||
      lastLoadedSellerRef.current === sellerId
    ) {
      return;
    }

    loadingRef.current = true;
    lastLoadedSellerRef.current = sellerId;

    try {
      // Charger les reviews du vendeur
      await dispatch(getSellerReviewsAction(sellerId));

      // Charger les reviews de l'utilisateur connecté si demandé
      if (shouldLoadMyReviews) {
        await dispatch(getMyReviewsAction());
      }
    } finally {
      loadingRef.current = false;
    }
  }, [sellerId, shouldLoadMyReviews, dispatch]);

  // Charger les reviews au montage du composant
  useEffect(() => {
    loadReviewsData();
  }, [loadReviewsData]);

  // Fonction pour recharger les reviews après modification
  const refreshReviews = useCallback(() => {
    if (sellerId) {
      // Réinitialiser les refs pour permettre un nouveau chargement
      lastLoadedSellerRef.current = undefined;
      loadReviewsData();
    }
  }, [sellerId, loadReviewsData]);

  return {
    ratingStats,
    userRating: ratingStats.averageRating,
    totalReviews: ratingStats.totalReviews,
    refreshReviews,
  };
};
