import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useThemeColors } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  viewCount: number;
  createdAt: string;
}

interface BoostOfferModalProps {
  visible: boolean;
  product: Product | null;
  onAccept: () => void;
  onDecline: () => void;
}

const BoostOfferModal: React.FC<BoostOfferModalProps> = ({
  visible,
  product,
  onAccept,
  onDecline,
}) => {
  const colors = useThemeColors();

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.iconBadge}>
                <Icon name="trending-up" size={20} color="#FFF" />
              </View>
              <Text style={styles.headerTitle}>Boostez votre visibilité</Text>
            </View>
            <TouchableOpacity onPress={onDecline}>
              <Icon name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Card du produit */}
            <View style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={styles.badge}>
                  <Icon name="eye-outline" size={12} color="#b91c1c" />
                  <Text style={styles.badgeText}>⚠️ Visibilité faible</Text>
                </View>
                <Text style={styles.viewCount}>
                  {product.viewCount} vue{product.viewCount !== 1 ? 's' : ''}
                </Text>
              </View>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
            </View>

            {/* Alerte */}
            <View style={styles.alertBox}>
              <Text style={styles.alertTitle}>🔻 Votre annonce ne décolle pas !</Text>
              <Text style={styles.alertText}>
                Les annonces boostées obtiennent 10x plus de vues et se vendent plus vite !
              </Text>
            </View>

            {/* Bénéfices */}
            <View style={styles.benefitsContainer}>
              <View style={styles.benefitRow}>
                <Icon name="flash" size={16} color="#16a34a" />
                <Text style={styles.benefitText}>Visibilité maximale</Text>
              </View>
              <View style={styles.benefitRow}>
                <Icon name="people" size={16} color="#2563eb" />
                <Text style={styles.benefitText}>Plus d'acheteurs</Text>
              </View>
              <View style={styles.benefitRow}>
                <Icon name="time" size={16} color="#9333ea" />
                <Text style={styles.benefitText}>Vente rapide</Text>
              </View>
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={onDecline}
            >
              <Text style={styles.declineButtonText}>Plus tard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={onAccept}
            >
              <Text style={styles.acceptButtonText}>Voir les forfaits</Text>
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
    padding: 16,
  },
  modalContainer: {
    width: width - 32,
    maxWidth: 400,
    borderRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#f97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  content: {
    padding: 16,
  },
  productCard: {
    borderWidth: 2,
    borderColor: '#fb923c',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff7ed',
    marginBottom: 12,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#b91c1c',
    marginLeft: 4,
  },
  viewCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ea580c',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  alertBox: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 12,
    color: '#7f1d1d',
  },
  benefitsContainer: {
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '600',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: 'transparent',
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
  },
});

export default BoostOfferModal;
