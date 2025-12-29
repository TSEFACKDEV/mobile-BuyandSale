import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../hooks/store';
import type { RootState } from '../store';

interface HasRolesProps {
  children: React.ReactNode;
  requiredRoles: string[];
}

/**
 * 🔐 Guard de rôles pour Buy&Sale Mobile
 *
 * Vérifie si l'utilisateur a les rôles requis selon votre architecture actuelle.
 * Compatible avec votre système de rôles USER/SUPER_ADMIN.
 *
 * 🎯 UTILISATION:
 * <HasRoles requiredRoles={["SUPER_ADMIN"]}>
 *   <AdminPanel />
 * </HasRoles>
 *
 * @param children - Composant à afficher si l'utilisateur a les rôles requis
 * @param requiredRoles - Liste des rôles requis (au moins un doit correspondre)
 */
const HasRoles: React.FC<HasRolesProps> = ({ children, requiredRoles }) => {
  const navigation = useNavigation();
  const authState = useAppSelector((state: RootState) => state.authentification);

  const isAuthenticated = authState.auth.entities !== null;
  const user = authState.auth.entities;

  useEffect(() => {
    // Si pas connecté, rediriger vers login
    if (!isAuthenticated || !user) {
      (navigation as any).navigate('Auth', { screen: 'Login' });
      return;
    }

    // Vérifier les rôles selon votre structure de données
    const userRoles = user.roles?.map((userRole) => userRole.role.name) || [];
    const hasRequiredRole = requiredRoles.some((requiredRole) =>
      userRoles.includes(requiredRole)
    );

    // Si pas le bon rôle, afficher alerte et rediriger
    if (!hasRequiredRole) {
      Alert.alert(
        'Accès refusé',
        "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
        [
          {
            text: 'OK',
            onPress: () => (navigation as any).navigate('Main', { screen: 'HomeTab' }),
          },
        ]
      );
    }
  }, [isAuthenticated, user, requiredRoles, navigation]);

  // Si pas connecté ou pas le bon rôle, ne rien afficher
  if (!isAuthenticated || !user) {
    return null;
  }

  const userRoles = user.roles?.map((userRole) => userRole.role.name) || [];
  const hasRequiredRole = requiredRoles.some((requiredRole) =>
    userRoles.includes(requiredRole)
  );

  if (!hasRequiredRole) {
    return null;
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>;
};

export default HasRoles;
