import { View, Text, Pressable, ScrollView, Alert } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AuthStackParamList, RootStackParamList } from '../../../types/navigation'
import { useNavigation } from '@react-navigation/native'
import TextInput from '../../../components/TextImput'
import Button from '../../../components/Button'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import styles from './style'
import COLORS from '../../colors'
import { useAppDispatch, useAppSelector } from '../../../hooks/store'
import { registerAction } from '../../../store/register/actions'
import { selectUserRegisted } from '../../../store/register/slice'
import { LoadingType } from '../../../models/store'
import type { UserRegisterForm } from '../../../models/user'
import { Loading } from '../../../components/LoadingVariants'
import { normalizePhoneNumber, validateCameroonPhone } from '../../../utils/phoneUtils'

type RegisterNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>
type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>

const Register = () => {
  const navigation = useNavigation<RegisterNavigationProp>()
  const navigation1 = useNavigation<AuthNavigationProp>()
  const dispatch = useAppDispatch()

  // ✅ Pattern Redux standardisé avec hooks typés
  const registerState = useAppSelector(selectUserRegisted)
  const isLoading = registerState.status === LoadingType.PENDING

  const [firstName, setFirstName] = React.useState<string>('')
  const [lastName, setLastName] = React.useState<string>('')
  const [email, setEmail] = React.useState<string>('')
  const [phone, setPhone] = React.useState<string>('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [agreedToTerms, setAgreedToTerms] = React.useState(false)

  const [firstNameError, setFirstNameError] = React.useState('')
  const [lastNameError, setLastNameError] = React.useState('')
  const [emailError, setEmailError] = React.useState('')
  const [phoneError, setPhoneError] = React.useState('')
  const [passwordError, setPasswordError] = React.useState('')
  const [confirmPasswordError, setConfirmPasswordError] = React.useState('')
  const [termsError, setTermsError] = React.useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleRegister = async () => {
    setFirstNameError('')
    setLastNameError('')
    setEmailError('')
    setPhoneError('')
    setPasswordError('')
    setConfirmPasswordError('')
    setTermsError('')

    let isValid = true

    // Validation Prénom
    if (!firstName.trim()) {
      setFirstNameError('Prénom requis')
      isValid = false
    } else if (firstName.trim().length < 2) {
      setFirstNameError('Minimum 2 caractères')
      isValid = false
    }

    // Validation Nom
    if (!lastName.trim()) {
      setLastNameError('Nom requis')
      isValid = false
    } else if (lastName.trim().length < 2) {
      setLastNameError('Minimum 2 caractères')
      isValid = false
    }

    // Validation Email
    if (!email.trim()) {
      setEmailError('Email requis')
      isValid = false
    } else if (!validateEmail(email)) {
      setEmailError('Email invalide')
      isValid = false
    }

    // Validation Téléphone
    if (!phone) {
      setPhoneError('Téléphone requis')
      isValid = false
    } else if (!validateCameroonPhone(phone)) {
      setPhoneError('Numéro de téléphone camerounais invalide (format: 6XX XX XX XX)')
      isValid = false
    }

    // Validation Mot de passe
    if (!password.trim()) {
      setPasswordError('Mot de passe requis')
      isValid = false
    } else if (password.length < 6) {
      setPasswordError('Minimum 6 caractères')
      isValid = false
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setPasswordError('Au moins 1 lettre et 1 chiffre requis')
      isValid = false
    }

    // Validation Confirmation Mot de passe
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Confirmez votre mot de passe')
      isValid = false
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas')
      isValid = false
    }

    // Validation Conditions
    if (!agreedToTerms) {
      setTermsError('Veuillez accepter les conditions')
      isValid = false
    }

    if (isValid) {
      try {
        // ✅ Dispatch de l'action Redux registerAction
        const result = await dispatch(
          registerAction({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: normalizePhoneNumber(phone),
            password: password,
          })
        ).unwrap()

        // 🎉 Inscription réussie - Navigation vers vérification OTP avec userId
        Alert.alert(
          'Inscription réussie',
          'Un code de vérification vous a été envoyé',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('VerifyOTP', {
                  userId: result.data?.userId,
                })
              },
            },
          ]
        )
      } catch (error: unknown) {
        // 🚨 Gestion d'erreurs améliorée
        let errorMessage = 'Erreur lors de l\'inscription'

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
        if (errorMessage.includes('existe déjà') || errorMessage.includes('already exists')) {
          if (errorMessage.includes('email')) {
            setEmailError('Cet email est déjà utilisé')
          } else if (errorMessage.includes('téléphone') || errorMessage.includes('phone')) {
            setPhoneError('Ce numéro est déjà utilisé')
          } else {
            Alert.alert('Erreur', errorMessage, [{ text: 'OK' }])
          }
        } else {
          Alert.alert('Erreur', errorMessage, [{ text: 'OK' }])
        }
      }
    }
  }

  if (isLoading) {
    return <Loading fullScreen message="Inscription en cours..." />;
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
              name="account-plus-outline"
              size={48}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            Rejoignez notre communauté et commencez à acheter et vendre
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* First Name Input */}
          <TextInput
            label="Prénom"
            type="text"
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text)
              setFirstNameError('')
            }}
            placeholder="TSEFACK"
            error={firstNameError}
            required
            leftIcon="person-outline"
          />

          {/* Last Name Input */}
          <TextInput
            label="Nom"
            type="text"
            value={lastName}
            onChangeText={(text) => {
              setLastName(text)
              setLastNameError('')
            }}
            placeholder="KLEIN"
            error={lastNameError}
            required
            leftIcon="person-outline"
          />

          {/* Email Input */}
          <TextInput
            label="Email"
            type="email"
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              setEmailError('')
            }}
            placeholder="exemple@email.com"
            error={emailError}
            required
          />

          {/* Phone Input */}
          <TextInput
            label="Téléphone"
            type="phone"
            value={phone}
            onChangeText={(text) => {
              setPhone(text)
              setPhoneError('')
            }}
            placeholder="+237 6XX XXX XXX"
            error={phoneError}
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
            placeholder="Entrez un mot de passe sécurisé"
            error={passwordError}
            required
          />

          {/* Confirm Password Input */}
          <TextInput
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text)
              setConfirmPasswordError('')
            }}
            placeholder="Confirmez votre mot de passe"
            error={confirmPasswordError}
            required
          />

          {/* Terms & Conditions */}
          <View style={styles.termsContainer}>
            <Pressable
              style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}
              onPress={() => {
                setAgreedToTerms(!agreedToTerms)
                setTermsError('')
              }}
            >
              {agreedToTerms && (
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={COLORS.white}
                />
              )}
            </Pressable>
            <Text style={styles.termsText}>
              J'accepte les{' '}
              <Text style={styles.termsLink}>conditions d'utilisation</Text> et
              la{' '}
              <Text style={styles.termsLink}>politique de confidentialité</Text>
            </Text>
          </View>
          {termsError && <Text style={styles.errorText}>{termsError}</Text>}

          {/* Register Button */}
          <Button
            title={isLoading ? 'Création en cours...' : 'S\'inscrire'}
            onPress={handleRegister}
            disabled={isLoading}
            containerStyle={styles.registerButton}
          />

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Vous avez un compte ? </Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Se connecter</Text>
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
            Inscription gratuite et sécurisée
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

export default Register