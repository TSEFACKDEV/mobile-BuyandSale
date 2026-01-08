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
import { useTranslation } from '../../hooks/useTranslation';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B35',
};

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
  productName?: string;
  isLoading?: boolean;
}

const ForfaitSelectorModal: React.FC<ForfaitSelectorModalProps> = ({
  visible,
  forfaits,
  onSelect,
  onSkip,
  onClose,
  productName = 'votre annonce',
  isLoading = false,
}) => {
  const colors = useThemeColors();
  const { t } = useTranslation();

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
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerContent}>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('userProfile.forfaitSelector.title')}
              </Text>
              {productName && (
                <Text style={[styles.productName, { color: colors.textSecondary }]} numberOfLines={1}>
                  {t('userProfile.forfaitSelector.for')} {productName}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Forfaits List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {t('userProfile.forfaitSelector.loading')}
                </Text>
              </View>
            ) : forfaits.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="pricetags-outline" size={64} color="#CBD5E1" />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {t('userProfile.forfaitSelector.noForfaits')}
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('userProfile.forfaitSelector.noForfaitsMessage')}
                </Text>
              </View>
            ) : (
              <>
                {forfaits.map((forfait) => (
                  <TouchableOpacity
                    key={forfait.id}
                    style={[
                      styles.forfaitCard,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                    onPress={() => onSelect(forfait.type, forfait.id)}
                  >
                  <View style={styles.forfaitHeader}>
                    <View
                      style={[
                        styles.iconBadge,
                        { backgroundColor: `${getForfaitColor(forfait.type)}15` },
                      ]}
                    >
                      <Icon
                        name={getForfaitIcon(forfait.type)}
                        size={28}
                        color={getForfaitColor(forfait.type)}
                      />
                    </View>
                    <View style={styles.forfaitInfo}>
                      <Text style={[styles.forfaitName, { color: colors.text }]}>
                        {getForfaitLabel(forfait.type)}
                      </Text>
                      <Text style={[styles.forfaitDuration, { color: colors.textSecondary }]}>
                        {forfait.duration} {t('userProfile.forfaitSelector.daysVisibility')}
                      </Text>
                      {forfait.description && (
                        <Text style={[styles.forfaitDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                          {forfait.description}
                        </Text>
                      )}
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.price, { color: COLORS.primary }]}>
                        {forfait.price.toLocaleString()}
                      </Text>
                      <Text style={[styles.currency, { color: colors.textSecondary }]}>
                        {t('userProfile.forfaitSelector.currency')}
                      </Text>
                    </View>
                  </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>

          {/* Skip Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.skipButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={onSkip}
            >
              <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
                {t('userProfile.forfaitSelector.continueWithout')}
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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    paddingBottom: 20,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  productName: {
    fontSize: 13,
    fontWeight: '400',
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    padding: 16,
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
    marginBottom: 12,
  },
  forfaitHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forfaitInfo: {
    flex: 1,
  },
  forfaitName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  forfaitDuration: {
    fontSize: 13,
    marginBottom: 4,
  },
  forfaitDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  currency: {
    fontSize: 11,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  skipButton: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default ForfaitSelectorModal;
