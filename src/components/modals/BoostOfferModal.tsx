import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useThemeColors } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface BoostOfferModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const BoostOfferModal: React.FC<BoostOfferModalProps> = ({
  visible,
  onAccept,
  onDecline,
}) => {
  const colors = useThemeColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDecline}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onDecline}>
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Icon name="rocket" size={64} color="#FF6B35" />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: colors.text }]}>
              Boostez votre annonce !
            </Text>

            {/* Description */}
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Augmentez la visibilité de votre annonce avec nos forfaits de boost.
              Votre produit sera mis en avant et attirera plus d'acheteurs !
            </Text>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <Icon name="eye" size={20} color="#34C759" />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Plus de visibilité
                </Text>
              </View>
              <View style={styles.feature}>
                <Icon name="trending-up" size={20} color="#34C759" />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Ventes plus rapides
                </Text>
              </View>
              <View style={styles.feature}>
                <Icon name="star" size={20} color="#34C759" />
                <Text style={[styles.featureText, { color: colors.text }]}>
                  Position prioritaire
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.acceptButton]}
                onPress={onAccept}
              >
                <Icon name="checkmark-circle" size={20} color="#FFF" />
                <Text style={styles.acceptButtonText}>Oui, je veux booster</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.declineButton, { borderColor: colors.border }]}
                onPress={onDecline}
              >
                <Text style={[styles.declineButtonText, { color: colors.text }]}>
                  Non merci, peut-être plus tard
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
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
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '500',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: '#FF6B35',
  },
  acceptButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  declineButton: {
    borderWidth: 1,
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BoostOfferModal;
