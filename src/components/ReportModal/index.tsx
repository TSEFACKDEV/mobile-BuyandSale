import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppDispatch } from '../../hooks/store';
import { reportUserAction } from '../../store/user/actions';
import { useThemeColors } from '../../contexts/ThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './style';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName: string;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  { value: 'fraud', key: 'reasonFraud' },
  { value: 'spam', key: 'reasonSpam' },
  { value: 'abuse', key: 'reasonAbuse' },
  { value: 'other', key: 'reasonOther' },
] as const;

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  sellerId,
  sellerName,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ reason: '', details: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setFormData({ reason: '', details: '' });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!formData.reason) {
      setError(t('sellerProfile.reportModal.selectReason'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await dispatch(
        reportUserAction({
          id: sellerId,
          reason: formData.reason,
          details: formData.details,
        })
      ).unwrap();

      setSuccess(true);
      onSuccess?.();

      setTimeout(() => {
        resetForm();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Erreur lors du signalement';
      
      // Traduire les messages d'erreur du backend
      if (errorMessage.includes('already reported')) {
        setError(t('sellerProfile.alreadyReported') || 'Vous avez déjà signalé cet utilisateur');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Icon name="flag" size={24} color="#EF4444" />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  {t('sellerProfile.reportModal.title')}
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                  {t('sellerProfile.reportModal.reporting')} {sellerName}
                </Text>
              </View>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Reason Select */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t('sellerProfile.reportModal.reason')}</Text>
                <View style={styles.reasonButtons}>
                  {REPORT_REASONS.map(({ value, key }) => (
                    <TouchableOpacity
                      key={value}
                      onPress={() => setFormData((prev) => ({ ...prev, reason: value }))}
                      style={[
                        styles.reasonButton,
                        formData.reason === value && styles.reasonButtonActive,
                        { borderColor: colors.border },
                      ]}
                    >
                      <Icon
                        name={formData.reason === value ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={formData.reason === value ? '#F97316' : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.reasonButtonText,
                          { color: formData.reason === value ? '#F97316' : colors.text },
                        ]}
                      >
                        {t(`sellerProfile.reportModal.${key}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Details TextArea */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{t('sellerProfile.reportModal.details')}</Text>
                <TextInput
                  value={formData.details}
                  onChangeText={(value) =>
                    setFormData((prev) => ({ ...prev, details: value }))
                  }
                  placeholder={t('sellerProfile.reportModal.detailsPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: colors.border,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Success Message */}
            {success && (
              <View style={styles.successContainer}>
                <Icon name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.successText}>{t('sellerProfile.reportModal.success')}</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={handleClose}
                disabled={loading}
                style={[
                  styles.button,
                  styles.cancelButton,
                  { backgroundColor: colors.border },
                  loading && styles.buttonDisabled,
                ]}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!formData.reason || loading}
                style={[
                  styles.button,
                  styles.submitButton,
                  (!formData.reason || loading) && styles.buttonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>{t('sellerProfile.reportModal.submit')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ReportModal;
