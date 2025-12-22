import { View, Text, Pressable, ScrollView, Switch } from 'react-native'
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
import { useAuth } from '../../../contexts/AuthContext'

type LoginNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>

const Login = () => {
  const navigation = useNavigation<LoginNavigationProp>()
  const { login } = useAuth()
  const [identifier, setIdentifier] = React.useState<string>('')
  const [password, setPassword] = React.useState('')
  const [rememberMe, setRememberMe] = React.useState(false)
  const [identifierError, setIdentifierError] = React.useState('')
  const [passwordError, setPasswordError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

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
      setIsLoading(true)
      try {
        // Appeler la fonction login du contexte
        const success = await login(identifier, password)
        if (success) {
          // La navigation se fera automatiquement via RootNavigator
          // car isUserLoggedIn sera mise à jour
        } else {
          setIdentifierError('Email/téléphone ou mot de passe incorrect')
        }
      } catch (error) {
        setIdentifierError('Erreur lors de la connexion')
        console.error('Erreur login:', error)
      } finally {
        setIsLoading(false)
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