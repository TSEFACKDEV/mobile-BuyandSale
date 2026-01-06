import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useThemeColors } from '../../contexts/ThemeContext';
import { useAppDispatch } from '../../hooks/store';
import Icon from 'react-native-vector-icons/Ionicons';
import { normalizePhoneNumber, validateCameroonPhone } from '../../utils/phoneUtils';
import { assignForfaitWithPaymentAction } from '../../store/forfait/actions';

const { width } = Dimensions.get('window');

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
  const dispatch = useAppDispatch();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!validateCameroonPhone(phoneNumber)) {
      Alert.alert('Erreur', 'Numéro de téléphone camerounais invalide (format: 6XX XX XX XX)');
      return;
    }

    if (!productId || !forfaitType) {
      Alert.alert('Erreur', 'Informations manquantes pour le paiement');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await dispatch(
        assignForfaitWithPaymentAction({
          productId,
          forfaitType: forfaitType as any,
          phoneNumber: phoneNumber,
        })
      );

      if (result.meta.requestStatus === 'fulfilled') {
        const payment = (result.payload as any)?.payment;
        
        if (payment?.id) {
          onPaymentInitiated(payment.id);
        } else {
          Alert.alert('Erreur', 'Impossible de récupérer les informations de paiement');
        }
      } else {
        const errorMsg = (result.payload as any) || 'Erreur lors de l\'initiation du paiement';
        Alert.alert('Erreur', errorMsg);
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de l\'initiation du paiement');
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
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Paiement du forfait
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Forfait Info */}
            <View style={[styles.infoCard, { backgroundColor: colors.background }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Forfait
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {forfaitType}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Montant
                </Text>
                <Text style={[styles.infoValue, styles.priceText, { color: '#FF6B35' }]}>
                  {formatPrice(forfaitPrice)} FCFA
                </Text>
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.paymentMethod}>
              <View style={styles.methodHeader}>
                <Icon name="card" size={24} color="#FF6B35" />
                <Text style={[styles.methodTitle, { color: colors.text }]}>
                  Paiement Mobile Money
                </Text>
              </View>
              <Text style={[styles.methodDescription, { color: colors.textSecondary }]}>
                Entrez votre numéro de téléphone pour recevoir une notification de paiement
              </Text>
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Numéro de téléphone <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.phoneInputContainer, { borderColor: colors.border }]}>
                <View style={[styles.countryCode, { backgroundColor: colors.background }]}>
                  <Text style={[styles.countryCodeText, { color: colors.text }]}>+237</Text>
                </View>
                <TextInput
                  style={[styles.phoneInput, { color: colors.text }]}
                  placeholder="6 XX XX XX XX"
                  placeholderTextColor={colors.textSecondary}
                  value={phoneNumber}
                  onChangeText={(text) => setPhoneNumber(normalizePhoneNumber(text))}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Info Message */}
            <View style={styles.infoMessage}>
              <Icon name="information-circle" size={20} color="#007AFF" />
              <Text style={[styles.infoMessageText, { color: colors.textSecondary }]}>
                Vous recevrez une notification sur votre téléphone. Validez le paiement pour activer le forfait.
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              onPress={onClose}
              disabled={isProcessing}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Annuler
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
                    Payer {formatPrice(forfaitPrice)} FCFA
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
