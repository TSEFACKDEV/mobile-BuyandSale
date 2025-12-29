import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useAppDispatch } from '../../../../hooks/store';
import { initiatePaymentAction } from '../../../../store/payment/actions';

const { width } = Dimensions.get('window');

interface PaymentModalProps {
  visible: boolean;
  productId: string | null;
  forfaitId: string | null;
  onPaymentInitiated: (paymentData: any) => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  productId,
  forfaitId,
  onPaymentInitiated,
  onClose,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const dispatch = useAppDispatch();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return;
    }

    if (!productId || !forfaitId) {
      Alert.alert('Erreur', 'Informations de paiement manquantes');
      return;
    }

    setIsProcessing(true);

    try {
      const resultAction = await dispatch(
        initiatePaymentAction({
          productId,
          forfaitId,
          phoneNumber: `+237${phoneNumber}`,
        })
      );

      if (initiatePaymentAction.fulfilled.match(resultAction)) {
        onPaymentInitiated(resultAction.payload);
      } else {
        Alert.alert(
          'Erreur',
          'Impossible d\'initier le paiement. Veuillez réessayer.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors du paiement'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Paiement Mobile Money
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Icon name="card-outline" size={60} color="#FF6B35" />
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Entrez votre numéro de téléphone pour recevoir une notification de
            paiement via Mobile Money
          </Text>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Numéro de téléphone
            </Text>
            <View style={styles.phoneInputContainer}>
              <View
                style={[
                  styles.countryCode,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                <Text style={[styles.countryCodeText, { color: colors.text }]}>
                  +237
                </Text>
              </View>
              <TextInput
                style={[
                  styles.phoneInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="6XX XX XX XX"
                placeholderTextColor={colors.textSecondary}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={9}
                editable={!isProcessing}
              />
            </View>
          </View>

          {/* Info */}
          <View style={[styles.infoBox, { backgroundColor: colors.backgroundSecondary }]}>
            <Icon name="information-circle-outline" size={20} color="#007AFF" />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Vous recevrez une notification pour valider le paiement sur votre téléphone
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.payButton,
                (!phoneNumber || isProcessing) && styles.buttonDisabled,
              ]}
              onPress={handlePayment}
              disabled={!phoneNumber || isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.payButtonText}>Payer maintenant</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              onPress={onClose}
              disabled={isProcessing}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Annuler
              </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: Math.min(width - 40, 400),
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButton: {
    backgroundColor: '#34C759',
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default PaymentModal;
