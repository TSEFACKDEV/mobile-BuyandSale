import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useThemeColors } from '../../../contexts/ThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppSelector, useAppDispatch } from '../../../hooks/store';
import { createContactAction } from '../../../store/contact/actions';
import { selectUserAuthenticated } from '../../../store/authentification/slice';
import {
  selectContactStatus,
  selectContactError,
  selectContactSuccess,
  LoadingType,
  resetContactState,
} from '../../../store/contact/slice';
import { styles } from './styles';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  errors: Record<string, string>;
}

const SUBJECT_OPTIONS = [
  { key: 'technical', label: 'Support technique' },
  { key: 'general', label: 'Question générale' },
  { key: 'partnership', label: 'Partenariat' },
  { key: 'report', label: 'Signalement' },
  { key: 'suggestion', label: 'Suggestion' },
  { key: 'other', label: 'Autre' },
];

const Contact: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const user = useAppSelector(selectUserAuthenticated)?.entities;
  const contactStatus = useAppSelector(selectContactStatus);
  const contactError = useAppSelector(selectContactError);
  const contactSuccess = useAppSelector(selectContactSuccess);

  const [formData, setFormData] = useState<FormData>({
    name: user?.firstName || '',
    email: user?.email || '',
    subject: '',
    message: '',
    errors: {},
  });
  const [isSubjectPickerVisible, setIsSubjectPickerVisible] = useState(false);

  const isLoading = contactStatus === LoadingType.LOADING;

  // Réinitialiser le state au montage pour éviter l'alerte de succès au chargement
  useEffect(() => {
    dispatch(resetContactState());
  }, [dispatch]);

  useEffect(() => {
    if (contactSuccess) {
      Alert.alert(
        'Succès',
        'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
        [{ text: 'OK' }]
      );
      setFormData({
        name: user?.firstName || '',
        email: user?.email || '',
        subject: '',
        message: '',
        errors: {},
      });
    }
  }, [contactSuccess, user]);

  useEffect(() => {
    if (contactError) {
      Alert.alert('Erreur', contactError || 'Une erreur est survenue', [{ text: 'OK' }]);
    }
  }, [contactError]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      errors: { ...prev.errors, [field]: '' },
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const { name, email, subject, message } = formData;

    if (!name.trim()) errors.name = 'Le nom est requis';
    if (!email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email invalide';
    }
    if (!subject.trim()) errors.subject = 'Le sujet est requis';
    if (!message.trim()) {
      errors.message = 'Le message est requis';
    } else if (message.length < 10) {
      errors.message = 'Le message doit contenir au moins 10 caractères';
    }

    if (Object.keys(errors).length > 0) {
      setFormData((prev) => ({ ...prev, errors }));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const resultAction = await dispatch(
      createContactAction({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      })
    );
  };

  const getSelectedSubjectLabel = () => {
    const selected = SUBJECT_OPTIONS.find(
      (opt) => opt.label === formData.subject
    );
    return selected ? selected.label : 'Sélectionner un sujet';
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#FF6B35', '#F97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroIconContainer}>
            <Icon name="mail" size={48} color="#FFF" />
          </View>
          <Text style={styles.heroTitle}>
            {t('contact.title') || 'Contactez-nous'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {t('contact.subtitle') ||
              'Nous sommes là pour vous aider. Envoyez-nous un message et nous vous répondrons rapidement.'}
          </Text>
        </LinearGradient>

        {/* Contact Info Cards */}
        <View style={styles.contactInfoSection}>
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.infoIconContainer, { backgroundColor: '#FF6B35' + '20' }]}>
              <Icon name="mail-outline" size={24} color="#FF6B35" />
            </View>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Email</Text>
            <Text style={[styles.infoContent, { color: colors.text }]}>
              contact@buyandsale.cm
            </Text>
            <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
              Réponse sous 24-48h
            </Text>
          </View>

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.infoIconContainer, { backgroundColor: '#FF6B35' + '20' }]}>
              <Icon name="call-outline" size={24} color="#FF6B35" />
            </View>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Téléphone
            </Text>
            <Text style={[styles.infoContent, { color: colors.text }]}>
              +237 6XX XX XX XX
            </Text>
            <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
              Lun-Ven, 8h-18h
            </Text>
          </View>

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.infoIconContainer, { backgroundColor: '#FF6B35' + '20' }]}>
              <Icon name="location-outline" size={24} color="#FF6B35" />
            </View>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Adresse
            </Text>
            <Text style={[styles.infoContent, { color: colors.text }]}>
              Douala, Cameroun
            </Text>
            <Text style={[styles.infoSubtitle, { color: colors.textSecondary }]}>
              Littoral
            </Text>
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <Text style={[styles.formTitle, { color: colors.text }]}>
            Envoyez-nous un message
          </Text>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Nom complet *</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: formData.errors.name ? '#EF4444' : colors.border,
                },
              ]}
            >
              <Icon
                name="person-outline"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Votre nom"
                placeholderTextColor={colors.textSecondary}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
              />
            </View>
            {formData.errors.name && (
              <Text style={styles.errorText}>{formData.errors.name}</Text>
            )}
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: formData.errors.email ? '#EF4444' : colors.border,
                },
              ]}
            >
              <Icon
                name="mail-outline"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="votre@email.com"
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {formData.errors.email && (
              <Text style={styles.errorText}>{formData.errors.email}</Text>
            )}
          </View>

          {/* Subject Picker */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Sujet *</Text>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: formData.errors.subject ? '#EF4444' : colors.border,
                },
              ]}
              onPress={() => setIsSubjectPickerVisible(!isSubjectPickerVisible)}
            >
              <Icon
                name="document-text-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text
                style={[
                  styles.input,
                  {
                    color: formData.subject ? colors.text : colors.textSecondary,
                  },
                ]}
              >
                {getSelectedSubjectLabel()}
              </Text>
              <Icon
                name="chevron-down"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            {isSubjectPickerVisible && (
              <View
                style={[
                  styles.subjectPicker,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                {SUBJECT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={styles.subjectOption}
                    onPress={() => {
                      handleInputChange('subject', option.label);
                      setIsSubjectPickerVisible(false);
                    }}
                  >
                    <Text style={[styles.subjectOptionText, { color: colors.text }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {formData.errors.subject && (
              <Text style={styles.errorText}>{formData.errors.subject}</Text>
            )}
          </View>

          {/* Message Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Message *</Text>
            <View
              style={[
                styles.textAreaContainer,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: formData.errors.message ? '#EF4444' : colors.border,
                },
              ]}
            >
              <TextInput
                style={[styles.textArea, { color: colors.text }]}
                placeholder="Décrivez votre demande..."
                placeholderTextColor={colors.textSecondary}
                value={formData.message}
                onChangeText={(value) => handleInputChange('message', value)}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
            {formData.errors.message && (
              <Text style={styles.errorText}>{formData.errors.message}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isLoading ? ['#9CA3AF', '#9CA3AF'] : ['#FF6B35', '#F97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Icon name="send" size={20} color="#FFF" />
                  <Text style={styles.submitButtonText}>Envoyer le message</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Contact;