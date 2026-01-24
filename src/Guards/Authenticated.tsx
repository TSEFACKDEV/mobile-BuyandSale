import React, { useEffect } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAppSelector } from '../hooks/store';
import type { RootState } from '../store';

interface AuthenticatedProps {
  children: React.ReactNode;
}

/**
 * 🔐 Guard d'authentification pour Buy&Sale Mobile
 *
 * Vérifie si l'utilisateur est connecté et non suspendu en utilisant le store Redux.
 *
 * 🎯 UTILISATION:
 * <Authenticated>
 *   <MonComposantProtégé />
 * </Authenticated>
 *
 * @param children - Composant à afficher si authentifié et non suspendu
 */
const Authenticated: React.FC<AuthenticatedProps> = ({ children }) => {
  const navigation = useNavigation();
  const authState = useAppSelector((state: RootState) => state.authentification);

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = authState.auth.entities !== null;
  const user = authState.auth.entities;

  useEffect(() => {
    // Si pas connecté, rediriger directement vers Login (sans passer par Home)
    if (!isAuthenticated || !user) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'Auth', params: { screen: 'Login' } },
          ],
        })
      );
      return;
    }

    // Si utilisateur suspendu, rediriger vers page de suspension
    if (user.status === 'SUSPENDED') {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'Auth', params: { screen: 'AccountSuspended' } },
          ],
        })
      );
      return;
    }
  }, [isAuthenticated, user, navigation]);

  // Si pas connecté ou suspendu, ne rien afficher (redirection en cours)
  if (!isAuthenticated || !user || user.status === 'SUSPENDED') {
    return null;
  }

  // Si connecté et non suspendu, afficher le contenu
  return <>{children}</>;
};

export default Authenticated;
