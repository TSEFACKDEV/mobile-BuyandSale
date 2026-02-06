import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { GoogleAuthService } from '../services/googleAuthServiceSimple';
import { handleSocialAuthCallback } from '../store/authentification/actions';
import { useAppDispatch } from './store';
import { useTranslation } from './useTranslation';
import { useDialog } from '../contexts/DialogContext';

/**
 * Hook personnalisé pour gérer l'authentification Google
 * Élimine la duplication entre Login et Register
 */
export const useGoogleAuth = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { showWarning } = useDialog();
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    
    try {
      const result = await GoogleAuthService.signIn();
      
      if (!result.success || !result.accessToken) {
        throw new Error(result.error || 'Authentification échouée');
      }

      await dispatch(handleSocialAuthCallback({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      })).unwrap();
      
      // Redirection vers la page principale
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as any, params: { screen: 'HomeTab' } }],
      });
    } catch (error) {
      console.error('❌ [Google Auth] Erreur:', error);
      showWarning(
        t('auth.errors.title'),
        error instanceof Error ? error.message : t('auth.errors.google.authFailed')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { signInWithGoogle, isLoading };
};
