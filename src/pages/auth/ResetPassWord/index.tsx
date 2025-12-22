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

type ResetPasswordNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ResetPassword'
>

const ResetPassword = () => {
  const navigation = useNavigation<ResetPasswordNavigationProp>()

  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [passwordError, setPasswordError] = React.useState('')
  const [confirmPasswordError, setConfirmPasswordError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleResetPassword = async () => {
    setPasswordError('')
    setConfirmPasswordError('')

    let isValid = true

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

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Confirmez votre mot de passe')
      isValid = false
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas')
      isValid = false
    }

    if (isValid) {
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        navigation.navigate('Login')
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
    </LinearGradient>
  )
}

export default ResetPassword