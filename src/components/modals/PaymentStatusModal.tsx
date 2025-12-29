import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useThemeColors } from '../../contexts/ThemeContext';
import { useAppDispatch } from '../../hooks/store';
import Icon from 'react-native-vector-icons/Ionicons';
import { checkPaymentStatusAction } from '../../store/payment/actions';

const { width } = Dimensions.get('window');

interface PaymentStatusModalProps {
  visible: boolean;
  paymentId: string | null;
  onSuccess: () => void;
  onError: () => void;
  onClose: () => void;
}

type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  visible,
  paymentId,
  onSuccess,
  onError,
  onClose,
}) => {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();

  const [status, setStatus] = useState<PaymentStatus>('PENDING');
  const [attempts, setAttempts] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxAttempts = 40; // 40 tentatives * 3 secondes = 2 minutes

  useEffect(() => {
    if (visible && paymentId) {
      setStatus('PENDING');
      setAttempts(0);
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [visible, paymentId]);

  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Première vérification immédiate
    checkPaymentStatus();

    // Ensuite toutes les 3 secondes
    intervalRef.current = setInterval(() => {
      checkPaymentStatus();
    }, 3000);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentId) return;

    try {
      setAttempts((prev) => prev + 1);

      const result = await dispatch(checkPaymentStatusAction(paymentId));

      if (result.meta.requestStatus === 'fulfilled') {
        const paymentData = result.payload as any;
        const currentStatus = paymentData.status;

        setStatus(currentStatus);

        if (currentStatus === 'SUCCESS') {
          stopPolling();
          setTimeout(() => {
            onSuccess();
          }, 2000);
        } else if (currentStatus === 'FAILED' || currentStatus === 'CANCELLED') {
          stopPolling();
          setTimeout(() => {
            onError();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
    }

    // Arrêter après max tentatives
    if (attempts >= maxAttempts) {
      stopPolling();
      setStatus('FAILED');
      setTimeout(() => {
        onError();
      }, 2000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'PENDING':
        return <ActivityIndicator size="large" color="#FF6B35" />;
      case 'SUCCESS':
        return <Icon name="checkmark-circle" size={80} color="#34C759" />;
      case 'FAILED':
      case 'CANCELLED':
        return <Icon name="close-circle" size={80} color="#FF3B30" />;
      default:
        return <ActivityIndicator size="large" color="#FF6B35" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'PENDING':
        return 'Paiement en cours...';
      case 'SUCCESS':
        return 'Paiement réussi !';
      case 'FAILED':
        return 'Paiement échoué';
      case 'CANCELLED':
        return 'Paiement annulé';
      default:
        return 'Vérification...';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'PENDING':
        return 'Veuillez valider le paiement sur votre téléphone mobile.\nCela peut prendre quelques instants.';
      case 'SUCCESS':
        return 'Votre forfait a été activé avec succès !\nVotre annonce est maintenant boostée.';
      case 'FAILED':
        return 'Le paiement n\'a pas pu être effectué.\nVeuillez réessayer plus tard.';
      case 'CANCELLED':
        return 'Le paiement a été annulé.\nVous pouvez réessayer plus tard.';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'SUCCESS':
        return '#34C759';
      case 'FAILED':
      case 'CANCELLED':
        return '#FF3B30';
      default:
        return '#FF6B35';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={status !== 'PENDING' ? onClose : undefined}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          {/* Status Icon */}
          <View style={styles.iconContainer}>
            {getStatusIcon()}
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {getStatusTitle()}
          </Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {getStatusMessage()}
          </Text>

          {/* Progress Indicator for Pending */}
          {status === 'PENDING' && (
            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                Tentative {attempts}/{maxAttempts}
              </Text>
            </View>
          )}

          {/* Actions */}
          {status !== 'PENDING' && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: getStatusColor() }]}
              onPress={status === 'SUCCESS' ? onSuccess : onError}
            >
              <Text style={styles.buttonText}>
                {status === 'SUCCESS' ? 'Voir mon annonce' : 'Fermer'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Cancel for Pending */}
          {status === 'PENDING' && (
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Annuler
              </Text>
            </TouchableOpacity>
          )}
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
  modalContainer: {
    width: width - 40,
    maxWidth: 400,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PaymentStatusModal;
