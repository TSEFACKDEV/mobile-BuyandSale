import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
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
import { verifyOtpAction, resendOtpAction } from '../../../store/register/actions'
import { selectOtpVerification, selectResendOtp } from '../../../store/register/slice'
import { LoadingType } from '../../../models/store'
import { Loading } from '../../../components/LoadingVariants'
import { useTranslation } from '../../../hooks/useTranslation'
import { useDialog } from '../../../contexts/DialogContext'

type VerifyOTPNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'VerifyOTP'
>

type VerifyOTPRouteProp = RouteProp<AuthStackParamList, 'VerifyOTP'>

const VerifyOTP = () => {
  const navigation = useNavigation<VerifyOTPNavigationProp>()
  const route = useRoute<VerifyOTPRouteProp>()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { showWarning, showSuccess } = useDialog()

  // ✅ Pattern Redux standardisé avec hooks typés
  const otpState = useAppSelector(selectOtpVerification)
  const resendState = useAppSelector(selectResendOtp)
  const isLoading = otpState.status === LoadingType.PENDING
  const isResending = resendState.status === LoadingType.PENDING

  const [otp, setOtp] = React.useState('')
  const [otpError, setOtpError] = React.useState('')
  
  // ✅ Récupérer l'userId et la méthode d'envoi depuis les params de navigation
  const userId = route.params?.userId || ''
  const [method, setMethod] = React.useState<'SMS' | 'EMAIL' | undefined>(route.params?.method)
  const [contact, setContact] = React.useState<string | undefined>(route.params?.contact)

  const handleVerifyOTP = async () => {
    setOtpError('')

    if (!otp.trim()) {
      setOtpError(t('auth.errors.validation.otpRequired'))
      return
    }

    if (otp.length !== 6) {
      setOtpError(t('auth.errors.validation.otpLength'))
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      setOtpError(t('auth.errors.validation.otpDigitsOnly'))
      return
    }

    if (!userId) {
      showWarning(t('auth.errors.title'), t('auth.errors.account.userIdMissing'))
      return
    }

    try {
      // ✅ Dispatch de l'action Redux verifyOtpAction
      await dispatch(
        verifyOtpAction({
          otp: otp.trim(),
          userId: userId,
        })
      ).unwrap()

      // 🎉 Vérification réussie - Redirection automatique vers Login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    } catch (error: unknown) {
      // 🚨 Gestion d'erreurs
      let errorMessage = t('auth.errors.validation.otpInvalid')

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
      if (errorMessage.includes('expiré')) {
        setOtpError(t('auth.errors.validation.otpExpired'))
      } else if (errorMessage.includes('invalide') || errorMessage.includes('incorrect')) {
        setOtpError(t('auth.errors.validation.otpInvalid'))
      } else {
        showWarning(t('auth.errors.title'), errorMessage)
      }
    }
  }

  const handleResendOTP = async () => {
    if (!userId) {
      showWarning(t('auth.errors.title'), t('auth.errors.account.userIdMissing'))
      return
    }

    try {
      // ✅ Dispatch de l'action Redux resendOtpAction
      const result = await dispatch(resendOtpAction({ userId })).unwrap()

      // Mettre à jour la méthode et le contact si retournés par le backend
      if (result.data?.method) {
        setMethod(result.data.method as 'SMS' | 'EMAIL')
      }
      if (result.data?.contact) {
        setContact(result.data.contact)
      }

      showSuccess(t('auth.success.title'), t('auth.success.codeResent'))
      setOtp('') // Réinitialiser le champ OTP
    } catch (error: unknown) {
      let errorMessage = t('auth.errors.generic.resendCodeFailed')

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        const wrappedError = error as {
          message?: string
          error?: { message?: string }
        }
        if (wrappedError.message) {
          errorMessage = wrappedError.message
        }
      }

      showWarning(t('auth.errors.title'), errorMessage)
    }
  }

  if (isLoading) {
    return <Loading fullScreen message={t('auth.loading.verification')} />;
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
              name="shield-check-outline"
              size={48}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.title}>Vérification OTP</Text>
          <Text style={styles.subtitle}>
            Entrez le code à 6 chiffres reçu par email ou SMS
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* Info Box */}
          <View style={styles.infoBox}>
            <MaterialCommunityIcons
              name="information-outline"
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.infoText}>
              {method === 'SMS' 
                ? `Un code a été envoyé par SMS au ${contact || 'numéro de téléphone'}`
                : method === 'EMAIL'
                ? `Un code a été envoyé par email à ${contact || 'votre adresse'}`
                : 'Un code a été envoyé à votre adresse email ou numéro de téléphone'}
            </Text>
          </View>

          <TextInput
            label="Code OTP"
            type="otp"
            value={otp}
            onChangeText={(text) => {
              setOtp(text)
              setOtpError('')
            }}
            placeholder="000000"
            error={otpError}
            required
            maxLength={6}
          />

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Vous n'avez pas reçu le code ? </Text>
            <Pressable
              onPress={handleResendOTP}
              disabled={isResending}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.resendLink, isResending && { opacity: 0.5 }]}>
                {isResending ? 'Envoi...' : 'Renvoyer'}
              </Text>
            </Pressable>
          </View>

          <Button
            title={isLoading ? 'Vérification...' : 'Vérifier le code'}
            onPress={handleVerifyOTP}
            disabled={isLoading}
            containerStyle={styles.actionButton}
          />

          {/* Back Link */}
          <View style={styles.backContainer}>
            <Pressable
              onPress={() => navigation.navigate('Login')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backLink}>← Retour</Text>
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
            Votre code expire dans 10 minutes
          </Text>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

export default VerifyOTP