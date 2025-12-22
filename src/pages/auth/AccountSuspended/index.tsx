import { View, Text, Pressable, ScrollView, Linking } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../../../types/navigation'
import { useNavigation } from '@react-navigation/native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import styles from './style'
import COLORS from '../../colors'

type AccountSuspendedNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>

const AccountSuspended = () => {
  const navigation = useNavigation<AccountSuspendedNavigationProp>()

  const handleEmailSupport = () => {
    const email = 'buyandsalecmr@gmail.com'
    const subject = 'Demande de révision de suspension - Buy&Sale'
    const body = `Bonjour,\n\nJe souhaite faire appel de la suspension de mon compte.\n\nEmail du compte: \nNom complet: \nRaison de l'appel: \n\nMerci de votre attention.`
    
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  return (
    <LinearGradient colors={['#F9FAFB', '#F9FAFB']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.alertIcon}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={60}
              color="#DC2626"
            />
          </View>
          <Text style={styles.title}>Compte suspendu</Text>
          <Text style={styles.subtitle}>
            Votre compte a été temporairement suspendu
          </Text>
        </View>

        {/* Card Container */}
        <View style={styles.cardContainer}>
          {/* Reason Box */}
          <View style={styles.reasonBox}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={20}
              color="#DC2626"
            />
            <View style={styles.reasonContent}>
              <Text style={styles.reasonTitle}>Raison de la suspension</Text>
              <Text style={styles.reasonText}>
                Votre compte a été suspendu suite à une violation des conditions d'utilisation ou à des activités suspectes.
              </Text>
            </View>
          </View>

          {/* Contact Box */}
          <View style={styles.contactBox}>
            <View style={styles.contactHeader}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color="#F97316"
              />
              <Text style={styles.contactTitle}>Comment nous contacter</Text>
            </View>

            <View style={styles.contactItem}>
              <MaterialCommunityIcons name="email" size={16} color="#F97316" />
              <View style={styles.contactItemContent}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>buyandsalecmr@gmail.com</Text>
              </View>
            </View>

            <View style={styles.contactItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#F97316" />
              <View style={styles.contactItemContent}>
                <Text style={styles.contactLabel}>Délai de réponse</Text>
                <Text style={styles.contactValue}>24-48 heures</Text>
              </View>
            </View>
          </View>

          {/* Instructions Box */}
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsTitle}>Que faire ?</Text>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1.</Text>
              <Text style={styles.instructionText}>
                Contactez notre support via l'email ci-dessus
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2.</Text>
              <Text style={styles.instructionText}>
                Expliquez la situation et fournissez les détails de votre compte
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3.</Text>
              <Text style={styles.instructionText}>
                Attendez une réponse de notre équipe sous 24-48h
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <Pressable style={styles.emailButton} onPress={handleEmailSupport}>
            <MaterialCommunityIcons name="email" size={20} color={COLORS.white} />
            <Text style={styles.emailButtonText}>Contacter le support</Text>
          </Pressable>

          <Pressable
            style={styles.homeButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.homeButtonText}>Retour à la connexion</Text>
          </Pressable>

          {/* Footer Note */}
          <Text style={styles.footerNote}>
            Nous examinons chaque appel avec attention et équité
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

export default AccountSuspended
