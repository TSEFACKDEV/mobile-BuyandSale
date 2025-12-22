import { View, Text, Pressable, ScrollView, Alert } from 'react-native'
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

type VerifyOTPNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'VerifyOTP'
>

type VerifyOTPRouteProp = RouteProp<AuthStackParamList, 'VerifyOTP'>

const VerifyOTP = () => {
  const navigation = useNavigation<VerifyOTPNavigationProp>()
  const route = useRoute<VerifyOTPRouteProp>()
  const dispatch = useAppDispatch()

  // ✅ Pattern Redux standardisé avec hooks typés
  const otpState = useAppSelector(selectOtpVerification)
  const resendState = useAppSelector(selectResendOtp)
  const isLoading = otpState.status === LoadingType.PENDING
  const isResending = resendState.status === LoadingType.PENDING

  const [otp, setOtp] = React.useState('')
  const [otpError, setOtpError] = React.useState('')
  
  // ✅ Récupérer l'userId depuis les params de navigation
  const userId = route.params?.userId || ''

  const handleVerifyOTP = async () => {
    setOtpError('')

    if (!otp.trim()) {
      setOtpError('Code OTP requis')
      return
    }

    if (otp.length !== 6) {
      setOtpError('Le code doit contenir 6 chiffres')
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      setOtpError('Le code ne doit contenir que des chiffres')
      return
    }

    if (!userId) {
      Alert.alert('Erreur', 'ID utilisateur manquant', [{ text: 'OK' }])
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

      // 🎉 Vérification réussie - Rediriger vers Login (comme le frontend React)
      Alert.alert(
        'Succès',
        'Compte vérifié avec succès ! Vous pouvez maintenant vous connecter.',
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
      let errorMessage = 'Code OTP invalide'

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
        setOtpError('Code expiré. Demandez un nouveau code')
      } else if (errorMessage.includes('invalide') || errorMessage.includes('incorrect')) {
        setOtpError('Code OTP incorrect')
      } else {
        Alert.alert('Erreur', errorMessage, [{ text: 'OK' }])
      }
    }
  }

  const handleResendOTP = async () => {
    if (!userId) {
      Alert.alert('Erreur', 'ID utilisateur manquant', [{ text: 'OK' }])
      return
    }

    try {
      // ✅ Dispatch de l'action Redux resendOtpAction
      await dispatch(resendOtpAction({ userId })).unwrap()

      Alert.alert('Succès', 'Un nouveau code a été envoyé', [{ text: 'OK' }])
      setOtp('') // Réinitialiser le champ OTP
    } catch (error: unknown) {
      let errorMessage = 'Erreur lors du renvoi du code'

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

      Alert.alert('Erreur', errorMessage, [{ text: 'OK' }])
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
              Un code a été envoyé à votre adresse email ou numéro de téléphone
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
              onPress={() => navigation.navigate('ForgotPassword')}
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
    </LinearGradient>
  )
}

export default VerifyOTP