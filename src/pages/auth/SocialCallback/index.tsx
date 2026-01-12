import { View, Text, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../../../types/navigation'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useAppDispatch } from '../../../hooks/store'
import { handleSocialAuthCallback } from '../../../store/authentification/actions'
import styles from './style'
import COLORS from '../../colors'
import Button from '../../../components/Button'
import { useDialog } from '../../../contexts/DialogContext'

type SocialCallbackNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'SocialCallback'
>

type SocialCallbackRouteProp = RouteProp<AuthStackParamList, 'SocialCallback'>

const SocialCallback = () => {
  const navigation = useNavigation<SocialCallbackNavigationProp>()
  const route = useRoute<SocialCallbackRouteProp>()
  const dispatch = useAppDispatch()
  const { showSuccess } = useDialog()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Extraire le token de l'URL (passé en paramètres de navigation)
        const token = route.params?.token

        if (!token) {
          setError('Token d\'authentification manquant')
          setIsLoading(false)
          return
        }

        // Dispatch l'action pour récupérer les infos utilisateur avec le token
        const resultAction = await dispatch(handleSocialAuthCallback(token))

        if (handleSocialAuthCallback.fulfilled.match(resultAction)) {
          // Authentification réussie
          const userData = resultAction.payload?.data

          // Afficher un message de succès
          showSuccess(
            'Succès',
            'Authentification Google réussie !'
          )
        } else {
          // Erreur d'authentification
          const errorMessage =
            resultAction.payload?.message || 'Erreur d\'authentification'
          setError(errorMessage)
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erreur d\'authentification'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    processAuth()
  }, [dispatch, route.params])

  if (isLoading) {
    return (
      <LinearGradient colors={['#F9FAFB', '#F9FAFB']} style={styles.container}>
        <View style={styles.centerContent}>
          {/* Logo Icon */}
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="google"
              size={60}
              color="#DB4437"
            />
          </View>

          <Text style={styles.title}>Authentification en cours</Text>
          <Text style={styles.subtitle}>
            Finalisation de l'authentification Google...
          </Text>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#F9FAFB', '#F9FAFB']} style={styles.container}>
      <View style={styles.centerContent}>
        {/* Card Container */}
        <View style={styles.card}>
          {/* Logo Icon */}
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons
              name="google"
              size={50}
              color="#DB4437"
            />
          </View>

          <Text style={styles.title}>Authentification Google</Text>

          {error ? (
            <>
              <View style={styles.errorBox}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={20}
                  color="#DC2626"
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>

              <Button
                title="Retour à la connexion"
                onPress={() => navigation.goBack()}
                containerStyle={styles.backButton}
              />
            </>
          ) : (
            <>
              <View style={styles.successBox}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#10B981"
                />
                <Text style={styles.successText}>
                  Authentification réussie ! Redirection en cours...
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </LinearGradient>
  )
}

export default SocialCallback
