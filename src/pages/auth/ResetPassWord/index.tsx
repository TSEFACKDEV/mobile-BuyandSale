import { View, Text, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../../../types/navigation'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import TextInput from '../../../components/TextImput'
import Button from '../../../components/Button'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import styles from './style'
import COLORS from '../../colors'
import { useAppDispatch, useAppSelector } from '../../../hooks/store'
import { resetPasswordAction } from '../../../store/password/actions'
import { selectResetPassword } from '../../../store/password/slice'
import { LoadingType } from '../../../models/store'
import { Loading } from '../../../components/LoadingVariants'
import { useTranslation } from '../../../hooks/useTranslation'

type ResetPasswordNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ResetPassword'
>

type ResetPasswordRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>

const ResetPassword = () => {
  const navigation = useNavigation<ResetPasswordNavigationProp>()
  const route = useRoute<ResetPasswordRouteProp>()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  // ✅ Pattern Redux standardisé avec hooks typés
  const resetPasswordState = useAppSelector(selectResetPassword)
  const isLoading = resetPasswordState.status === LoadingType.PENDING

  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [passwordError, setPasswordError] = React.useState('')
  const [confirmPasswordError, setConfirmPasswordError] = React.useState('')
  
  // Récupérer le token depuis les params de navigation (ou vide si non fourni)
  const token = (route.params as any)?.token || ''

  const handleResetPassword = async () => {
    setPasswordError('')
    setConfirmPasswordError('')

    let isValid = true

    if (!password.trim()) {
      setPasswordError(t('auth.errors.validation.passwordRequired'))
      isValid = false
    } else if (password.length < 6) {
      setPasswordError(t('auth.errors.validation.passwordMinLength'))
      isValid = false
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setPasswordError(t('auth.errors.validation.passwordComplexity'))
      isValid = false
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError(t('auth.errors.validation.confirmPasswordRequired'))
      isValid = false
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(t('auth.errors.validation.confirmPasswordMismatch'))
      isValid = false
    }

    if (!token) {
      Alert.alert(t('auth.errors.title'), t('auth.errors.account.tokenMissing'), [{ text: 'OK' }])
      return
    }

    if (isValid) {
      try {
        // ✅ Dispatch de l'action Redux resetPasswordAction
        await dispatch(
          resetPasswordAction({
            token: token,
            newPassword: password,
          })
        ).unwrap()

        // 🎉 Réinitialisation réussie
        Alert.alert(
          t('auth.success.title'),
          t('auth.success.passwordReset'),
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('Login')
              },
            },
          ]
        )
      } catch (error: unknown) {
        // 🚨 Gestion d'erreurs
        let errorMessage = t('auth.errors.generic.resetFailed')

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
        if (errorMessage.includes('expiré') || errorMessage.includes('expired')) {
          Alert.alert(
            t('auth.titles.tokenExpired'),
            t('auth.errors.token.expiredMessage'),
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('ForgotPassword')
                },
              },
            ]
          )
        } else if (errorMessage.includes('invalide') || errorMessage.includes('invalid')) {
          Alert.alert(t('auth.errors.title'), t('auth.errors.token.invalid'), [{ text: 'OK' }])
        } else {
          Alert.alert(t('auth.errors.title'), errorMessage, [{ text: 'OK' }])
        }
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
              name="lock-outline"
              size={48}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.title}>Nouveau mot de passe</Text>
          <Text style={styles.subtitle}>
            Créez un mot de passe fort pour sécuriser votre compte
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <TextInput
            label="Nouveau mot de passe"
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

          {/* Password Tips */}
          <View style={styles.tipsBox}>
            <MaterialCommunityIcons
              name="information-outline"
              size={16}
              color={COLORS.primary}
            />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Conseils de sécurité :</Text>
              <Text style={styles.tipItem}>• Au moins 6 caractères</Text>
              <Text style={styles.tipItem}>• Mélanger lettres et chiffres</Text>
              <Text style={styles.tipItem}>• Éviter mots personnels</Text>
            </View>
          </View>

          <Button
            title={isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            onPress={handleResetPassword}
            disabled={isLoading}
            containerStyle={styles.actionButton}
          />

          {/* Back Link */}
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
            Votre compte sera mieux protégé
          </Text>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

export default ResetPassword