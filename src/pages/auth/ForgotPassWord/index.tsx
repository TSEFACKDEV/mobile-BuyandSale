import { View, Text, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native'
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
import { forgotPasswordAction } from '../../../store/password/actions'
import { selectForgotPassword } from '../../../store/password/slice'
import { LoadingType } from '../../../models/store'
import { Loading } from '../../../components/LoadingVariants'
import { useTranslation } from '../../../hooks/useTranslation'

type ForgotPasswordNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>

const ForgotPassword = () => {
  const navigation = useNavigation<ForgotPasswordNavigationProp>()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  // ✅ Pattern Redux standardisé avec hooks typés
  const forgotPasswordState = useAppSelector(selectForgotPassword)
  const isLoading = forgotPasswordState.status === LoadingType.PENDING

  const [email, setEmail] = React.useState<string>('')
  const [emailError, setEmailError] = React.useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async () => {
    setEmailError('')

    if (!email.trim()) {
      setEmailError(t('auth.errors.validation.emailRequired'))
      return
    }

    if (!validateEmail(email)) {
      setEmailError(t('auth.errors.validation.emailInvalid'))
      return
    }

    try {
      // ✅ Dispatch de l'action Redux forgotPasswordAction
      await dispatch(
        forgotPasswordAction({
          email: email.trim(),
        })
      ).unwrap()

      // 🎉 Email envoyé avec succès
      Alert.alert(
        t('auth.titles.emailSent'),
        t('auth.success.emailSent'),
        [
          {
            text: 'OK',
            onPress: () => {
              // Optionnel : rediriger vers la page de connexion
              navigation.navigate('Login')
            },
          },
        ]
      )
    } catch (error: unknown) {
      // 🚨 Gestion d'erreurs
      let errorMessage = t('auth.errors.generic.sendEmailFailed')

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
      if (errorMessage.includes('introuvable') || errorMessage.includes('not found')) {
        setEmailError(t('auth.errors.account.emailNotFound'))
      } else {
        Alert.alert(t('auth.errors.title'), errorMessage, [{ text: 'OK' }])
      }
    }
  }

  if (isLoading) {
    return <Loading fullScreen message={t('auth.loading.sending')} />;
  }

  return (
    <LinearGradient colors={[COLORS.white, '#FFF9F0']} style={styles.container}>
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
              name="lock-reset"
              size={48}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.title}>Récupérer le compte</Text>
          <Text style={styles.subtitle}>
            Entrez votre email pour réinitialiser votre mot de passe
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
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

          <Button
            title={isLoading ? 'Envoi en cours...' : 'Continuer'}
            onPress={handleSubmit}
            disabled={isLoading}
            containerStyle={styles.actionButton}
          />

          {/* Back to Login */}
          <View style={styles.backContainer}>
            <Pressable
              onPress={() => navigation.navigate('Login')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backLink}>← Retour à la connexion</Text>
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
            Nous vous aiderons à accéder à votre compte
          </Text>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

export default ForgotPassword