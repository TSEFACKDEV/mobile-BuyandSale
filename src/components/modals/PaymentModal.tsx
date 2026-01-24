import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useThemeColors } from '../../contexts/ThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppDispatch } from '../../hooks/store';
import Icon from 'react-native-vector-icons/Ionicons';
import { assignForfaitWithPaymentAction } from '../../store/forfait/actions';

interface PaymentModalProps {
  visible: boolean;
  productId: string | null;
  forfaitId: string | null;
  forfaitType: string | null;
  forfaitPrice: number;
  onPaymentInitiated: (paymentId: string) => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  productId,
  forfaitId,
  forfaitType,
  forfaitPrice,
  onPaymentInitiated,
  onClose,
}) => {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Réinitialiser le numéro quand la modal s'ouvre
  useEffect(() => {
    if (visible) {
      setPhoneNumber('');
      setIsProcessing(false);
    }
  }, [visible]);

  // Gérer les changements d'input sans formatage
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    
    if (cleaned.length === 0) {
      setPhoneNumber('');
    } else if ((cleaned[0] === '6' || cleaned[0] === '7') && cleaned.length <= 9) {
      setPhoneNumber(cleaned);
    }
  };

  // Valider et normaliser le numéro pour le backend
  const normalizeAndValidate = (phone: string): { valid: boolean; normalized: string } => {
    const cleaned = phone.replace(/\D/g, '');
    
    // Retirer préfixes si présents
    let normalized = cleaned;
    if (normalized.startsWith('237')) normalized = normalized.substring(3);
    if (normalized.startsWith('0')) normalized = normalized.substring(1);
    
    // Valider format [67]XXXXXXXX
    const valid = /^[67]\d{8}$/.test(normalized);
    return { valid, normalized };
  };

  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert(t('userProfile.payment.error'), t('userProfile.payment.errorPhone'));
      return;
    }

    const { valid, normalized } = normalizeAndValidate(phoneNumber);
    if (!valid) {
      Alert.alert(t('userProfile.payment.error'), t('userProfile.payment.errorInvalidPhone'));
      return;
    }

    if (!productId || !forfaitType) {
      Alert.alert(t('userProfile.payment.error'), t('userProfile.payment.errorMissingInfo'));
      return;
    }

    setIsProcessing(true);

    try {
      const result = await dispatch(
        assignForfaitWithPaymentAction({
          productId,
          forfaitType: forfaitType as any,
          phoneNumber: normalized,
        })
      );

      if (result.meta.requestStatus === 'fulfilled') {
        const payment = (result.payload as any)?.payment;
        
        if (payment?.id) {
          onPaymentInitiated(payment.id);
        } else {
          Alert.alert(t('userProfile.payment.error'), t('userProfile.payment.errorPaymentInfo'));
        }
      } else {
        const errorMsg = (result.payload as any) || t('userProfile.payment.errorPaymentFailed');
        Alert.alert(t('userProfile.payment.error'), errorMsg);
      }
    } catch (error: any) {
      Alert.alert(t('userProfile.payment.error'), error.message || t('userProfile.payment.errorPaymentFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
                  {/* Header */}
                  <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>
                      {t('userProfile.payment.title')}
                    </Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <Icon name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  {/* Content with ScrollView */}
                  <ScrollView 
                    style={styles.scrollView}
                  contentContainerStyle={styles.content}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
            {/* Forfait Info */}
            <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t('userProfile.payment.forfait')}
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {forfaitType}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {t('userProfile.payment.amount')}
                </Text>
                <Text style={[styles.infoValue, styles.priceText, { color: '#FF6B35' }]}>
                  {formatPrice(forfaitPrice)} {t('userProfile.forfaitSelector.currency')}
                </Text>
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.paymentMethod}>
              <View style={styles.methodHeader}>
                <Icon name="card" size={24} color="#FF6B35" />
                <Text style={[styles.methodTitle, { color: colors.text }]}>
                  {t('userProfile.payment.methodTitle')}
                </Text>
              </View>
              <Text style={[styles.methodDescription, { color: colors.textSecondary }]}>
                {t('userProfile.payment.methodDescription')}
              </Text>
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t('userProfile.payment.phoneNumber')} <Text style={styles.required}>{t('userProfile.payment.required')}</Text>
              </Text>
              <View style={[styles.phoneInputContainer, { borderColor: colors.border }]}>
                <View style={[styles.countryCode, { backgroundColor: colors.background }]}>
                  <Text style={[styles.countryCodeText, { color: colors.text }]}>+237</Text>
                </View>
                <TextInput
                  style={[styles.phoneInput, { color: colors.text }]}
                  placeholder={t('userProfile.payment.phonePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  blurOnSubmit={true}
                  maxLength={9}
                />
              </View>
            </View>

            {/* Info Message */}
            <View style={styles.infoMessage}>
              <Icon name="information-circle" size={20} color="#007AFF" />
              <Text style={[styles.infoMessageText, { color: colors.textSecondary }]}>
                {t('userProfile.payment.infoMessage')}
              </Text>
            </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                    onPress={onClose}
                    disabled={isProcessing}
                  >
                    <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                      {t('userProfile.payment.cancel')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.payButton,
                      isProcessing && styles.buttonDisabled,
                    ]}
                    onPress={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <>
                        <Icon name="card" size={20} color="#FFF" />
                        <Text style={styles.payButtonText}>
                          {t('userProfile.payment.pay')} {formatPrice(forfaitPrice)} {t('userProfile.forfaitSelector.currency')}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                </View>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  keyboardView: {
    width: '100%',
  },
  modalContainer: {
    borderRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
  },
  paymentMethod: {
    gap: 8,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  methodDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  required: {
    color: '#FF3B30',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  infoMessage: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#007AFF15',
    borderRadius: 8,
  },
  infoMessageText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: '#FF6B35',
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default PaymentModal;
