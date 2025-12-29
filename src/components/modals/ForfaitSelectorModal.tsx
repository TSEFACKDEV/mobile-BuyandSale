import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useThemeColors } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface Forfait {
  id: string;
  type: string;
  price: number;
  duration: number;
  description: string | null;
}

interface ForfaitSelectorModalProps {
  visible: boolean;
  forfaits: Forfait[];
  onSelect: (forfaitType: string, forfaitId: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

const ForfaitSelectorModal: React.FC<ForfaitSelectorModalProps> = ({
  visible,
  forfaits,
  onSelect,
  onSkip,
  onClose,
}) => {
  const colors = useThemeColors();

  const getForfaitIcon = (type: string) => {
    switch (type) {
      case 'URGENT':
        return 'flash';
      case 'TOP_ANNONCE':
        return 'trophy';
      case 'PREMIUM':
        return 'star';
      default:
        return 'pricetag';
    }
  };

  const getForfaitColor = (type: string) => {
    switch (type) {
      case 'URGENT':
        return '#FF3B30';
      case 'TOP_ANNONCE':
        return '#FF9500';
      case 'PREMIUM':
        return '#FFD700';
      default:
        return '#FF6B35';
    }
  };

  const getForfaitLabel = (type: string) => {
    switch (type) {
      case 'URGENT':
        return 'Urgent';
      case 'TOP_ANNONCE':
        return 'Top Annonce';
      case 'PREMIUM':
        return 'Premium';
      default:
        return type;
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
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Choisissez un forfait
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Forfaits List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {forfaits.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="information-circle-outline" size={64} color="#CBD5E1" />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Aucun forfait disponible
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Les forfaits de boost ne sont pas disponibles pour le moment.
                  Vous pourrez en ajouter plus tard depuis votre profil.
                </Text>
              </View>
            ) : (
              forfaits.map((forfait) => (
                <TouchableOpacity
                  key={forfait.id}
                  style={[
                    styles.forfaitCard,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                  onPress={() => onSelect(forfait.type, forfait.id)}
                >
                  <View style={styles.forfaitHeader}>
                    <View
                      style={[
                        styles.iconBadge,
                        { backgroundColor: `${getForfaitColor(forfait.type)}20` },
                      ]}
                    >
                      <Icon
                        name={getForfaitIcon(forfait.type)}
                        size={24}
                        color={getForfaitColor(forfait.type)}
                      />
                    </View>
                    <View style={styles.forfaitInfo}>
                      <Text style={[styles.forfaitName, { color: colors.text }]}>
                        {getForfaitLabel(forfait.type)}
                      </Text>
                      <Text style={[styles.forfaitDuration, { color: colors.textSecondary }]}>
                        {forfait.duration} jours
                      </Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.price, { color: colors.text }]}>
                        {forfait.price.toLocaleString()}
                      </Text>
                      <Text style={[styles.currency, { color: colors.textSecondary }]}>
                        FCFA
                      </Text>
                    </View>
                  </View>

                  {forfait.description && (
                    <Text style={[styles.forfaitDescription, { color: colors.textSecondary }]}>
                      {forfait.description}
                    </Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Skip Button */}
          <TouchableOpacity
            style={[styles.skipButton, { borderColor: colors.border }]}
            onPress={onSkip}
          >
            <Text style={[styles.skipButtonText, { color: colors.text }]}>
              Passer cette étape
            </Text>
          </TouchableOpacity>
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
    maxHeight: '80%',
    paddingBottom: 20,
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
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  forfaitCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  forfaitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forfaitInfo: {
    flex: 1,
  },
  forfaitName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  forfaitDuration: {
    fontSize: 14,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  currency: {
    fontSize: 12,
  },
  forfaitDescription: {
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  skipButton: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ForfaitSelectorModal;
