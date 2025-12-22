import { View, Text, Pressable, ScrollView, Switch, Alert, Linking } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../../../types/navigation'
import { useNavigation } from '@react-navigation/native'
import TextInput from '../../../components/TextImput'
import Button from '../../../components/Button'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import styles from './style'
import COLORS from '../../colors'
import { useAppDispatch, useAppSelector } from '../../../hooks/store'
import { loginAction } from '../../../store/authentification/actions'
import { selectUserAuthenticated } from '../../../store/authentification/slice'
import { LoadingType } from '../../../models/store'
import type { UserLoginForm } from '../../../models/user'
import API_CONFIG from '../../../config/api.config'

type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>

const Login = () => {
  const navigation = useNavigation<LoginNavigationProp>()
  const dispatch = useAppDispatch()
  
  // ✅ Pattern Redux standardisé avec hooks typés
  const authState = useAppSelector(selectUserAuthenticated)
  const isLoading = authState.status === LoadingType.PENDING
  
  const [identifier, setIdentifier] = React.useState<string>('')
  const [password, setPassword] = React.useState('')
  const [rememberMe, setRememberMe] = React.useState(false)
  const [identifierError, setIdentifierError] = React.useState('')
  const [passwordError, setPasswordError] = React.useState('')

  // Déterminer si c'est un email ou un téléphone
  const getIdentifierType = (value: string): 'email' | 'phone' | 'invalid' => {
    const trimmed = value.trim()
    if (!trimmed) return 'invalid'

    // Vérifier si c'est un email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailRegex.test(trimmed)) return 'email'

    // Vérifier si c'est un téléphone camerounais (+237 ou 237)
    const phoneRegex = /^(\+237|237)\s?[0-9]{8,9}$|^[0-9]{8,9}$/
    if (phoneRegex.test(trimmed.replace(/\s/g, ''))) return 'phone'

    return 'invalid'
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    // Accepte: +237XXXXXXXXX, 237XXXXXXXXX ou XXXXXXXXX
    const cleanPhone = phone.replace(/\s/g, '')
    const phoneRegex = /^(\+237|237)\d{8,9}$|^\d{8,9}$/
    return phoneRegex.test(cleanPhone) && cleanPhone.replace(/\D/g, '').length >= 8
  }

  const validateIdentifier = (value: string): { isValid: boolean; error: string } => {
    const type = getIdentifierType(value)

    if (type === 'email') {
      return validateEmail(value)
        ? { isValid: true, error: '' }
        : { isValid: false, error: 'Email invalide' }
    }

    if (type === 'phone') {
      return validatePhone(value)
        ? { isValid: true, error: '' }
        : { isValid: false, error: 'Numéro invalide (ex: +237 6XX XXX XXX)' }
    }

    return {
      isValid: false,
      error: 'Entrez un email valide ou un numéro Camerounais',
    }
  }

  const handleGoogleLogin = async () => {
    try {
      // URL du backend pour Google OAuth
      const googleAuthUrl = `${API_CONFIG.BASE_URL}/auth/google`
      
      // Vérifier si l'URL peut être ouverte
      const supported = await Linking.canOpenURL(googleAuthUrl)
      
      if (supported) {
        await Linking.openURL(googleAuthUrl)
        
        Alert.alert(
          'Authentification Google',
          'Vous allez être redirigé vers Google pour vous authentifier. Une fois connecté, vous serez redirigé vers l\'application.',
          [{ text: 'OK' }]
        )
      } else {
        Alert.alert(
          'Erreur',
          'Impossible d\'ouvrir le navigateur pour l\'authentification Google.',
          [{ text: 'OK' }]
        )
      }
    } catch (error) {
      console.error('Erreur Google Auth:', error)
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de l\'authentification Google.',
        [{ text: 'OK' }]
      )
    }
  }

  const handleLogin = async () => {
    setIdentifierError('')
    setPasswordError('')

    let isValid = true

    if (!identifier.trim()) {
      setIdentifierError('Email ou téléphone requis')
      isValid = false
    } else {
      const validation = validateIdentifier(identifier)
      if (!validation.isValid) {
        setIdentifierError(validation.error)
        isValid = false
      }
    }

    if (!password.trim()) {
      setPasswordError('Mot de passe requis')
      isValid = false
    } else if (password.length < 6) {
      setPasswordError('Minimum 6 caractères')
      isValid = false
    }

    if (isValid) {
      try {
        // ✅ Dispatch de l'action Redux loginAction
        await dispatch(
          loginAction({
            identifiant: identifier.trim(),
            password: password,
          })
        ).unwrap()

        // 🎉 Connexion réussie - La navigation se fait automatiquement
        // car le store Redux est surveillé par le RootNavigator
        Alert.alert('Succès', 'Connexion réussie !', [{ text: 'OK' }])
      } catch (error: unknown) {
        // 🚨 Gestion d'erreurs améliorée
        let errorMessage = 'Erreur de connexion'

        if (error instanceof Error) {
          errorMessage = error.message
        } else if (typeof error === 'object' && error !== null) {
          const wrappedError = error as {
            message?: string
            error?: { message?: string }
          }
          if (wrappedError.message) {
            errorMessage = wrappedError.message
          } else if (wrappedError.error?.message) {
            errorMessage = wrappedError.error.message
          }
        }

        // Messages d'erreur spécifiques
        if (errorMessage.includes('Email ou mot de passe incorrect')) {
          setIdentifierError('Identifiants incorrects')
        } else if (errorMessage.includes('non vérifié')) {
          Alert.alert(
            'Compte non vérifié',
            'Veuillez vérifier votre email ou SMS.',
            [{ text: 'OK' }]
          )
        } else if (
          errorMessage.includes('suspendu') ||
          errorMessage === 'ACCOUNT_SUSPENDED'
        ) {
          Alert.alert(
            'Compte suspendu',
            'Votre compte a été temporairement suspendu. Contactez le support.',
            [{ text: 'OK' }]
          )
        } else {
          Alert.alert('Erreur', errorMessage, [{ text: 'OK' }])
        }
      }
    }
  }

  return (
    <LinearGradient colors={[COLORS.white, '#FFF9F0']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
            placeholder="exemple@email.com ou +237 6XX XXX XXX"
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

          {/* Remember Me & Forgot Password */}
          <View style={styles.optionsContainer}>
            <View style={styles.rememberMeContainer}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{
                  false: COLORS.border,
                  true: COLORS.primary + '40',
                }}
                thumbColor={rememberMe ? COLORS.primary : COLORS.textLight}
              />
              <Text style={styles.rememberMeText}>Se souvenir</Text>
            </View>

            <Pressable
              onPress={() => navigation.navigate('ForgotPassword')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.forgotPasswordLink}>Mot de passe oublié ?</Text>
            </Pressable>
          </View>

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
            style={styles.googleButton}
            onPress={handleGoogleLogin}
          >
            <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
            <Text style={styles.googleButtonText}>Continuer avec Google</Text>
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
    </LinearGradient>
  )
}

export default Login