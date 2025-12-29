import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../hooks/store';
import type { RootState } from '../store';

interface NotSuspendedProps {
  children: React.ReactNode;
}

/**
 * 🔐 Guard de vérification de suspension pour Buy&Sale Mobile
 *
 * Vérifie si l'utilisateur connecté n'est pas suspendu.
 * Si l'utilisateur est suspendu, le redirige vers la page de suspension.
 *
 * 🎯 UTILISATION:
 * <NotSuspended>
 *   <MonComposantProtégé />
 * </NotSuspended>
 *
 * @param children - Composant à afficher si l'utilisateur n'est pas suspendu
 */
const NotSuspended: React.FC<NotSuspendedProps> = ({ children }) => {
  const navigation = useNavigation();
  const authState = useAppSelector((state: RootState) => state.authentification);

  const user = authState.auth.entities;

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté et s'il est suspendu
    if (user && user.status === 'SUSPENDED') {
      (navigation as any).navigate('Auth', { screen: 'AccountSuspended' });
      return;
    }
  }, [user, navigation]);

  // Si l'utilisateur est suspendu, ne pas afficher le contenu
  if (user && user.status === 'SUSPENDED') {
    return null;
  }

  // Si tout va bien, afficher le contenu
  return <>{children}</>;
};

export default NotSuspended;
