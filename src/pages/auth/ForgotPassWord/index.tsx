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

type ForgotPasswordNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>

const ForgotPassword = () => {
  const navigation = useNavigation<ForgotPasswordNavigationProp>()

  const [identifier, setIdentifier] = React.useState<string>('')
  const [identifierError, setIdentifierError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/\s/g, '')
    const phoneRegex = /^(\+237|237)\d{8,9}$|^\d{8,9}$/
    return phoneRegex.test(cleanPhone) && cleanPhone.replace(/\D/g, '').length >= 8
  }

  const validateIdentifier = (value: string): { isValid: boolean; error: string } => {
    const trimmed = value.trim()

    if (!trimmed) {
      return { isValid: false, error: 'Email ou téléphone requis' }
    }

    if (validateEmail(trimmed)) {
      return { isValid: true, error: '' }
    }

    if (validatePhone(trimmed)) {
      return { isValid: true, error: '' }
    }

    return {
      isValid: false,
      error: 'Entrez un email valide ou un numéro Camerounais',
    }
  }

  const handleSubmit = async () => {
    setIdentifierError('')

    const validation = validateIdentifier(identifier)
    if (!validation.isValid) {
      setIdentifierError(validation.error)
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Navigation vers ResetPassword
      navigation.navigate('ResetPassword')
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
              name="lock-reset"
              size={48}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.title}>Récupérer le compte</Text>
          <Text style={styles.subtitle}>
            Entrez votre email ou téléphone pour réinitialiser votre mot de passe
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
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
    </LinearGradient>
  )
}

export default ForgotPassword