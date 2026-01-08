import { View, Text, Pressable, ScrollView, Alert, TouchableOpacity, BackHandler, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../../../types/navigation'
import { useNavigation } from '@react-navigation/native'
import TextInput from '../../../components/TextImput'
import Button from '../../../components/Button'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Ionicons from '@expo/vector-icons/Ionicons'
import styles from './style'
import COLORS from '../../colors'
import { useAppDispatch, useAppSelector } from '../../../hooks/store'
import { loginAction, handleSocialAuthCallback } from '../../../store/authentification/actions'
import { selectUserAuthenticated } from '../../../store/authentification/slice'
import { LoadingType } from '../../../models/store'
import { GoogleAuthService } from '../../../services/googleAuthService'
import API_CONFIG from '../../../config/api.config'
import { Loading } from '../../../components/LoadingVariants'
import { normalizePhoneNumber, validateCameroonPhone } from '../../../utils/phoneUtils'
import { useTranslation } from '../../../hooks/useTranslation'

type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>

const Login = () => {
  const navigation = useNavigation<LoginNavigationProp>()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  
  const authState = useAppSelector(selectUserAuthenticated)
  const isLoading = authState.status === LoadingType.PENDING
  
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [identifierError, setIdentifierError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Configuration Google Auth avec Expo AuthSession
  const [request, response, promptAsync] = GoogleAuthService.useGoogleAuth()

  // Gérer le bouton retour Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('Main' as any, { screen: 'HomeTab' });
      return true;
    });
    return () => backHandler.remove();
  }, [navigation]);

  // 🔐 Gérer la réponse de Google OAuth
  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSuccess(response.authentication?.accessToken);
    } else if (response?.type === 'error') {
      setIsGoogleLoading(false);
      Alert.alert(t('auth.errors.title'), t('auth.errors.google.authFailed'));
    } else if (response?.type === 'cancel') {
      setIsGoogleLoading(false);
    }
  }, [response]);

  // 🔐 Traiter le succès de l'authentification Google
  const handleGoogleSuccess = async (googleAccessToken?: string) => {
    if (!googleAccessToken) {
      Alert.alert(t('auth.errors.title'), t('auth.errors.google.tokenNotReceived'));
      setIsGoogleLoading(false);
      return;
    }

    try {


      // Échanger le token Google avec notre backend
      const result = await GoogleAuthService.authenticateWithBackend(
        googleAccessToken
      );

      if (result.success && result.accessToken) {
        // Dispatch l'action Redux pour sauvegarder les données utilisateur
        const resultAction = await dispatch(
          handleSocialAuthCallback(result.accessToken)
        );

        if (handleSocialAuthCallback.fulfilled.match(resultAction)) {
          Alert.alert(t('auth.success.title'), t('auth.success.googleLogin'));
          // La navigation se fera automatiquement via RootNavigator
        } else {
          throw new Error(t('auth.errors.google.profileFailed'));
        }
      } else {
        throw new Error(result.error || t('auth.errors.google.authFailed'));
      }
    } catch (error) {
      // TODO: Implémenter système de logging
      Alert.alert(
        t('auth.errors.title'),
        error instanceof Error ? error.message : t('auth.errors.google.authFailed')
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // 🔐 Initier l'authentification Google
  const handleGoogleLogin = async () => {
    // Vérifier que la configuration Google est présente
    if (!GoogleAuthService.isConfigured()) {
      Alert.alert(
        'Configuration manquante',
        'L\'authentification Google n\'est pas configurée. Veuillez contacter l\'administrateur.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!request) {
      Alert.alert(
        'Erreur',
        'Authentification Google non disponible pour le moment.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsGoogleLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      // TODO: Implémenter système de logging
      setIsGoogleLoading(false);
      Alert.alert('Erreur', 'Impossible d\'initier l\'authentification Google');
    }
  };

  // Validation avec phoneUtils (comme web)
  const validateIdentifier = (value: string): { isValid: boolean; error: string } => {
    const trimmed = value.trim()
    if (!trimmed) return { isValid: false, error: 'Email ou téléphone requis' }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    // Tester d'abord l'email
    if (emailRegex.test(trimmed)) {
      return { isValid: true, error: '' }
    }
    
    // Puis tester le téléphone avec phoneUtils
    if (validateCameroonPhone(trimmed)) {
      return { isValid: true, error: '' }
    }
    
    return { isValid: false, error: 'Email invalide ou numéro Camerounais invalide (format: 6XX XX XX XX)' }
  }

  const handleLogin = async () => {
    setIdentifierError('')
    setPasswordError('')

    const identifierValidation = validateIdentifier(identifier)
    if (!identifierValidation.isValid) {
      setIdentifierError(identifierValidation.error)
      return
    }

    if (!password.trim()) {
      setPasswordError(t('auth.errors.validation.passwordRequired'))
      return
    }

    if (password.length < 6) {
      setPasswordError(t('auth.errors.validation.passwordMinLength'))
      return
    }

    try {
      // Normaliser si c'est un téléphone (comme web)
      const normalizedIdentifier = validateCameroonPhone(identifier) 
        ? normalizePhoneNumber(identifier)
        : identifier.trim();
      
      await dispatch(loginAction({
        identifiant: normalizedIdentifier,
        password: password,
      })).unwrap()

      // Redirection automatique vers la page principale
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as any, params: { screen: 'HomeTab' } }],
      })
    } catch (error: any) {
      const errorMessage = error?.message || error?.error?.message || t('auth.errors.generic.loginFailed')

      if (errorMessage.includes('Email ou mot de passe incorrect')) {
        setIdentifierError(t('auth.errors.generic.incorrectCredentials'))
      } else if (errorMessage.includes('non vérifié')) {
        Alert.alert(t('auth.errors.account.notVerified'), t('auth.errors.account.verifyPrompt'), [{ text: 'OK' }])
      } else if (errorMessage.includes('suspendu') || errorMessage === 'ACCOUNT_SUSPENDED') {
        Alert.alert(t('auth.errors.account.suspended'), t('auth.errors.account.suspendedMessage'), [{ text: 'OK' }])
      } else {
        Alert.alert(t('auth.errors.title'), errorMessage, [{ text: 'OK' }])
      }
    }
  }

  if (isLoading) {
    return <Loading fullScreen message={t('auth.loading.login')} />;
  }

  return (
    <LinearGradient colors={[COLORS.white, '#FFF9F0']} style={styles.container}>
      {/* Bouton retour */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.navigate('Main' as any, { screen: 'HomeTab' })}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="login-variant"
              size={48}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>
            Veuillez vous connecter pour accéder à votre compte
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* Email or Phone Input */}
          <TextInput
            label="Email ou Téléphone"
            type="email"
            value={identifier}
            onChangeText={(text) => {
              setIdentifier(text)
              setIdentifierError('')
            }}
            placeholder="@email.com ou 6XX"
            error={identifierError}
            required
          />

          {/* Password Input */}
          <TextInput
            label="Mot de passe"
            type="password"
            value={password}
            onChangeText={(text) => {
              setPassword(text)
              setPasswordError('')
            }}
            placeholder="Entrez votre mot de passe"
            error={passwordError}
            required
          />

          {/* Forgot Password */}
          <Pressable
            onPress={() => navigation.navigate('ForgotPassword')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ alignSelf: 'flex-end', marginBottom: 16, marginTop: 4 }}
          >
            <Text style={styles.forgotPasswordLink}>Mot de passe oublié ?</Text>
          </Pressable>

          {/* Login Button */}
          <Button
            title={isLoading ? 'Connexion en cours...' : 'Se connecter'}
            onPress={handleLogin}
            disabled={isLoading}
            containerStyle={styles.loginButton}
          />

          {/* Divider OR */}
          <View style={styles.orDivider}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OU</Text>
            <View style={styles.orLine} />
          </View>

          {/* Google Auth Button */}
          <Pressable
            style={[
              styles.googleButton,
              (!request || isGoogleLoading || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleGoogleLogin}
            disabled={!request || isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <>
                <ActivityIndicator color="#DB4437" size="small" />
                <Text style={styles.googleButtonText}>Connexion...</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
                <Text style={styles.googleButtonText}>Continuer avec Google</Text>
              </>
            )}
          </Pressable>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Vous n'avez pas de compte ? </Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>S'inscrire</Text>
            </Pressable>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Footer Info */}
        <View style={styles.footerInfo}>
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={20}
            color={COLORS.success}
          />
          <Text style={styles.footerText}>
            Vos données sont sécurisées et chiffrées
          </Text>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

export default Login