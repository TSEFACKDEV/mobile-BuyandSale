import { View, Text, Pressable, ScrollView } from 'react-native'
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

type VerifyOTPNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'VerifyOTP'
>

const VerifyOTP = () => {
  const navigation = useNavigation<VerifyOTPNavigationProp>()

  const [otp, setOtp] = React.useState('')
  const [otpError, setOtpError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

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

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Navigation vers ResetPassword
      navigation.navigate('Login')
    } finally {
      setIsLoading(false)
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
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.resendLink}>Renvoyer</Text>
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