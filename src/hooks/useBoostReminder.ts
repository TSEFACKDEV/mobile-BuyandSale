import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSelector } from './store';
import { selectUserAuthenticated } from '../store/authentification/slice';

interface LowVisibilityProduct {
  id: string;
  name: string;
  viewCount: number;
  createdAt: string;
}

const STORAGE_KEY = 'lastBoostReminderShown';
const REMINDER_INTERVAL_DAYS = 2; // Maximum 2 fois tous les 2 jours
const MIN_VIEWS_THRESHOLD = 10; // Moins de 10 vues = faible visibilité
const MIN_PRODUCT_AGE_DAYS = 2; // Produit doit avoir au moins 2 jours

/**
 * Hook intelligent pour suggérer le boost d'annonces avec faible visibilité
 * - Fréquence : maximum 2 fois tous les 2 jours
 * - Critères : produits validés, < 10 vues, ≥ 2 jours, sans forfait actif
 * - Sélection intelligente : moins de vues d'abord, puis plus ancien
 */
export const useBoostReminder = () => {
  const [productToBoost, setProductToBoost] = useState<LowVisibilityProduct | null>(null);
  const [shouldShow, setShouldShow] = useState(false);

  const authData = useAppSelector(selectUserAuthenticated);
  const user = authData.entities;
  const allProducts = useAppSelector((state) => state.product.validatedProducts);

  useEffect(() => {
    const checkAndShowReminder = async () => {
      // Ne rien faire si utilisateur non connecté ou pas de produits
      if (!user || !allProducts?.length) {
        setProductToBoost(null);
        setShouldShow(false);
        return;
      }

      // Vérifier la fréquence d'affichage
      const lastShown = await AsyncStorage.getItem(STORAGE_KEY);
      if (lastShown) {
        const daysSinceLastShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
        if (daysSinceLastShown < REMINDER_INTERVAL_DAYS) {
          return;
        }
      }

      // Filtrer pour avoir SEULEMENT les produits de l'utilisateur connecté
      const myProducts = allProducts.filter(
        (p: any) => p.userId === user.id || p.user?.id === user.id
      );

      if (myProducts.length === 0) {
        return;
      }

      // Analyser les produits avec faible visibilité
      const now = new Date();
      const lowVisibilityProducts = myProducts
        .filter((product: any) => {
          // Vérifier l'âge du produit
          const createdDate = new Date(product.createdAt);
          const ageInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

          // Vérifier si le produit a déjà un forfait actif et non expiré
          const hasActiveForfait = product.productForfaits?.some(
            (pf: any) => pf.isActive && new Date(pf.expiresAt) > now
          );

          // Critères : validé, ancien de 2+ jours, moins de 10 vues, SANS forfait actif
          return (
            product.status === 'VALIDATED' &&
            ageInDays >= MIN_PRODUCT_AGE_DAYS &&
            (product.viewCount || 0) < MIN_VIEWS_THRESHOLD &&
            !hasActiveForfait
          );
        })
        .map((product: any) => ({
          id: product.id,
          name: product.name,
          viewCount: product.viewCount || 0,
          createdAt: product.createdAt,
        }))
        .sort((a: LowVisibilityProduct, b: LowVisibilityProduct) => {
          // Trier par nombre de vues croissant (moins de vues = prioritaire)
          if (a.viewCount !== b.viewCount) {
            return a.viewCount - b.viewCount;
          }
          // Si même nombre de vues, trier par date (plus ancien en premier)
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

      // Sélectionner le produit le plus prioritaire
      if (lowVisibilityProducts.length > 0) {
        setProductToBoost(lowVisibilityProducts[0]);
        setShouldShow(true);
      } else {
        setProductToBoost(null);
        setShouldShow(false);
      }
    };

    checkAndShowReminder();
  }, [user, allProducts]);

  const handleAccept = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, Date.now().toString());
    setShouldShow(false);
  };

  const handleDecline = async () => {
    // Enregistrer la date actuelle pour respecter la fréquence
    await AsyncStorage.setItem(STORAGE_KEY, Date.now().toString());
    setShouldShow(false);
    setProductToBoost(null);
  };

  return {
    shouldShow,
    productToBoost,
    handleAccept,
    handleDecline,
  };
};
