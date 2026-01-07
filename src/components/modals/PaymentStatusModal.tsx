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
  const [countdownDisplay, setCountdownDisplay] = useState(10);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const maxAttempts = 4; // Seulement 4 vérifications (le webhook backend active automatiquement)

  useEffect(() => {
    if (visible && paymentId) {
      setStatus('PENDING');
      setAttempts(0);
      setCountdownDisplay(10);
      startPolling();
    }

    return () => {
      stopPolling();
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [visible, paymentId]);

  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Première vérification immédiate
    checkPaymentStatus();

    // Ensuite toutes les 15 secondes
    intervalRef.current = setInterval(() => {
      checkPaymentStatus();
    }, 15000);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentId) return;

    // Si max tentatives atteint, arrêter le polling seulement
    if (attempts >= maxAttempts) {
      stopPolling();
      return;
    }

    setAttempts((prev) => prev + 1);

    try {
      const result = await dispatch(checkPaymentStatusAction(paymentId));

      if (result.meta.requestStatus === 'fulfilled') {
        const paymentData = result.payload as any;
        const currentStatus = paymentData.status;

        setStatus(currentStatus);

        if (currentStatus === 'SUCCESS') {
          stopPolling();
          setCountdownDisplay(10);
          
          // Démarrer le compte à rebours
          countdownRef.current = setInterval(() => {
            setCountdownDisplay((prev) => {
              if (prev <= 1) {
                if (countdownRef.current) {
                  clearInterval(countdownRef.current);
                  countdownRef.current = null;
                }
                // Utiliser setTimeout pour éviter setState pendant le rendu
                setTimeout(() => {
                  onSuccess();
                }, 0);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else if (currentStatus === 'FAILED' || currentStatus === 'CANCELLED') {
          stopPolling();
          setTimeout(() => {
            onError();
          }, 10000);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
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
        return 'Veuillez valider le paiement sur votre téléphone.\nLe forfait sera activé automatiquement.';
      case 'SUCCESS':
        return `Merci pour votre paiement !\nVotre forfait a été activé avec succès.\n\nRedirection dans ${countdownDisplay} seconde${countdownDisplay > 1 ? 's' : ''}...`;
      case 'FAILED':
        return 'Le paiement n\'a pas pu être effectué.\nVeuillez réessayer.';
      case 'CANCELLED':
        return 'Le paiement a été annulé.\nVous pouvez réessayer.';
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

          {/* Actions */}
          {status !== 'PENDING' && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: getStatusColor() }]}
              onPress={status === 'SUCCESS' ? () => {
                // Arrêter le countdown si l'utilisateur clique manuellement
                if (countdownRef.current) {
                  clearInterval(countdownRef.current);
                  countdownRef.current = null;
                }
                onSuccess();
              } : onError}
            >
              <Text style={styles.buttonText}>
                {status === 'SUCCESS' ? 'Retour à l\'accueil' : 'Fermer'}
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
