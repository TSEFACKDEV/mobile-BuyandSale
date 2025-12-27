import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../hooks/store';
import type { RootState } from '../store';

interface HasPermissionsProps {
  children: React.ReactNode;
  requiredPermissions: string[];
  requireAll?: boolean; // Par défaut false = au moins une permission suffit
}

/**
 * 🔐 Guard de permissions pour Buy&Sale Mobile
 *
 * Vérifie si l'utilisateur a les permissions requises selon votre architecture.
 *
 * 🎯 UTILISATION:
 * <HasPermissions requiredPermissions={["USER_CREATE", "USER_UPDATE"]}>
 *   <UserManagement />
 * </HasPermissions>
 *
 * @param children - Composant à afficher si l'utilisateur a les permissions
 * @param requiredPermissions - Liste des permissions requises
 * @param requireAll - Si true, toutes les permissions sont requises. Si false, au moins une suffit
 */
const HasPermissions: React.FC<HasPermissionsProps> = ({
  children,
  requiredPermissions,
  requireAll = false,
}) => {
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

    // Extraire les permissions de l'utilisateur selon votre structure
    const userPermissions: string[] = [];

    // Récupérer les permissions via les rôles
    if (user.roles && user.roles.length > 0) {
      user.roles.forEach((userRole) => {
        if (userRole.role.permissions && userRole.role.permissions.length > 0) {
          userRole.role.permissions.forEach((rolePermission) => {
            if (
              rolePermission.permission &&
              rolePermission.permission.permissionKey
            ) {
              userPermissions.push(rolePermission.permission.permissionKey);
            }
          });
        }
      });
    }

    // Vérifier les permissions
    const hasPermissions = requireAll
      ? requiredPermissions.every((permission) =>
          userPermissions.includes(permission)
        )
      : requiredPermissions.some((permission) =>
          userPermissions.includes(permission)
        );

    // Si pas les bonnes permissions, afficher alerte et rediriger
    if (!hasPermissions) {
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
  }, [isAuthenticated, user, requiredPermissions, requireAll, navigation]);

  // Si pas connecté, ne rien afficher
  if (!isAuthenticated || !user) {
    return null;
  }

  // Extraire les permissions de l'utilisateur
  const userPermissions: string[] = [];
  if (user.roles && user.roles.length > 0) {
    user.roles.forEach((userRole) => {
      if (userRole.role.permissions && userRole.role.permissions.length > 0) {
        userRole.role.permissions.forEach((rolePermission) => {
          if (
            rolePermission.permission &&
            rolePermission.permission.permissionKey
          ) {
            userPermissions.push(rolePermission.permission.permissionKey);
          }
        });
      }
    });
  }

  // Vérifier les permissions
  const hasPermissions = requireAll
    ? requiredPermissions.every((permission) =>
        userPermissions.includes(permission)
      )
    : requiredPermissions.some((permission) =>
        userPermissions.includes(permission)
      );

  if (!hasPermissions) {
    return null;
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>;
};

export default HasPermissions;
