import { View, Text, Pressable, ScrollView, TouchableOpacity, BackHandler, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
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
import { loginAction } from '../../../store/authentification/actions'
import { selectUserAuthenticated } from '../../../store/authentification/slice'
import { LoadingType } from '../../../models/store'
import { Loading } from '../../../components/LoadingVariants'
import { normalizePhoneNumber, validateCameroonPhone } from '../../../utils/phoneUtils'
import { useTranslation } from '../../../hooks/useTranslation'
import { useDialog } from '../../../contexts/DialogContext'
import { useGoogleAuth } from '../../../hooks/useGoogleAuth'

type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>

const Login = () => {
  const navigation = useNavigation<LoginNavigationProp>()
  const { t } = useTranslation()
  const { showWarning, showSuccess } = useDialog()
  const dispatch = useAppDispatch()
  
  const authState = useAppSelector(selectUserAuthenticated)
  const isLoading = authState.status === LoadingType.PENDING
  
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [identifierError, setIdentifierError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth()

  // Gérer le bouton retour Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('Main' as any, { screen: 'HomeTab' });
      return true;
    });
    return () => backHandler.remove();
  }, [navigation]);

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

      // 🚦 Gestion du rate limiting (10 tentatives max / 15 minutes)
      if (errorMessage.includes('Trop de tentatives')) {
        // Utiliser un message clair au lieu du message technique du serveur
        showWarning(
          t('auth.errors.rateLimit.title'),
          t('auth.errors.rateLimit.message')
        )
        return
      }

      if (errorMessage.includes('Email ou mot de passe incorrect')) {
        setIdentifierError(t('auth.errors.generic.incorrectCredentials'))
      } else if (errorMessage.includes('non vérifié')) {
        showWarning(t('auth.errors.account.notVerified'), t('auth.errors.account.verifyPrompt'))
      } else if (errorMessage.includes('suspendu') || errorMessage === 'ACCOUNT_SUSPENDED') {
        // Rediriger vers la page AccountSuspended au lieu d'afficher une simple alerte
        navigation.navigate('AccountSuspended' as any)
      } else {
        showWarning(t('auth.errors.title'), errorMessage)
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
              (isGoogleLoading || isLoading) && styles.buttonDisabled,
            ]}
            onPress={signInWithGoogle}
            disabled={isGoogleLoading || isLoading}
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