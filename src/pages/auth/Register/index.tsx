import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
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
import { handleSocialAuthCallback } from '../../../store/authentification/actions'
import { selectUserRegisted } from '../../../store/register/slice'
import { LoadingType } from '../../../models/store'
import type { UserRegisterForm } from '../../../models/user'
<<<<<<< HEAD
import { GoogleAuthService } from '../../../services/googleAuthService'
=======
import { Loading } from '../../../components/LoadingVariants'
>>>>>>> f22e267a215db3d8c21e6beec5d3112afac0620e

type RegisterNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>
type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>

const Register = () => {
  const navigation = useNavigation<RegisterNavigationProp>()
  const navigation1 = useNavigation<AuthNavigationProp>()
  const dispatch = useAppDispatch()

  // ✅ Pattern Redux standardisé avec hooks typés
  const registerState = useAppSelector(selectUserRegisted)
  const isLoading = registerState.status === LoadingType.PENDING

  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Configuration Google Auth
  const [request, response, promptAsync] = GoogleAuthService.useGoogleAuth()

  const [firstNameError, setFirstNameError] = useState('')
  const [lastNameError, setLastNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [termsError, setTermsError] = useState('')

  // 🔐 Gérer la réponse de Google OAuth
  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSuccess(response.authentication?.accessToken);
    } else if (response?.type === 'error') {
      setIsGoogleLoading(false);
      Alert.alert('Erreur', 'Échec de l\'authentification Google');
    } else if (response?.type === 'cancel') {
      setIsGoogleLoading(false);
    }
  }, [response]);

  // 🔐 Traiter le succès de l'authentification Google
  const handleGoogleSuccess = async (googleAccessToken?: string) => {
    if (!googleAccessToken) {
      Alert.alert('Erreur', 'Token Google non reçu');
      setIsGoogleLoading(false);
      return;
    }

    try {
      console.log('🔐 [Register] Authentification Google en cours...');

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
          Alert.alert('Succès', 'Inscription Google réussie !');
          // La navigation se fera automatiquement via RootNavigator
        } else {
          throw new Error('Échec de récupération du profil utilisateur');
        }
      } else {
        throw new Error(result.error || 'Authentification Google échouée');
      }
    } catch (error) {
      console.error('❌ [Register] Erreur Google Auth:', error);
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Erreur d\'authentification Google'
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // 🔐 Initier l'authentification Google
  const handleGoogleRegister = async () => {
    if (!GoogleAuthService.isConfigured()) {
      Alert.alert(
        'Configuration manquante',
        'L\'authentification Google n\'est pas configurée.',
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
      console.error('❌ [Register] Erreur promptAsync:', error);
      setIsGoogleLoading(false);
      Alert.alert('Erreur', 'Impossible d\'initier l\'authentification Google');
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/\s/g, '')
    const phoneRegex = /^(\+237|237)\d{8,9}$|^\d{8,9}$/
    return phoneRegex.test(cleanPhone) && cleanPhone.replace(/\D/g, '').length >= 8
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
    if (!phone.trim()) {
      setPhoneError('Téléphone requis')
      isValid = false
    } else if (!validatePhone(phone)) {
      setPhoneError('Numéro invalide (ex: +237 6XX XXX XXX)')
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
            phone: phone.trim(),
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
            disabled={isLoading || isGoogleLoading}
            containerStyle={styles.registerButton}
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
            onPress={handleGoogleRegister}
            disabled={!request || isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <>
                <ActivityIndicator color="#DB4437" size="small" />
                <Text style={styles.googleButtonText}>Inscription...</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
                <Text style={styles.googleButtonText}>Continuer avec Google</Text>
              </>
            )}
          </Pressable>

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