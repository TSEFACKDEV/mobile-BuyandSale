import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../contexts/ThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import API_ENDPOINTS from '../../helpers/api';
import API_CONFIG from '../../config/api.config';
import { getImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageUtils';
import { styles } from './styles';


interface Payment {
  id: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  paidAt?: string;
  forfait: {
    id: string;
    type: 'PREMIUM' | 'TOP_ANNONCE' | 'URGENT';
    price: number;
    duration: number;
    description?: string;
  };
  product: {
    id: string;
    name: string;
    images: string[];
    status: string;
  };
  activeForfait?: {
    id: string;
    activatedAt: string;
    expiresAt: string;
    isActive: boolean;
  };
  isExpired?: boolean;
  remainingDays?: number;
}

interface PaymentHistoryProps {
  userId?: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ userId }) => {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayments = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/${API_ENDPOINTS.PAYMENT_GET_USER}?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('buyAndSale-token')}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      
      const data = await response.json();

      if (data.success || data.data) {
        setPayments(data.data.payments || data.data);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments(currentPage);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPayments(1);
  }, [fetchPayments]);

  const getStatusIcon = (status: Payment['status']) => {
    const icons = {
      SUCCESS: 'checkmark-circle',
      PENDING: 'time',
      FAILED: 'close-circle',
      CANCELLED: 'close-circle-outline',
      EXPIRED: 'alert-circle',
    };
    return icons[status];
  };

  const getStatusColor = (status: Payment['status']) => {
    const colorMap = {
      SUCCESS: '#10b981',
      PENDING: '#f59e0b',
      FAILED: '#ef4444',
      CANCELLED: '#6b7280',
      EXPIRED: '#f97316',
    };
    return colorMap[status];
  };

  const getForfaitTypeLabel = (type: Payment['forfait']['type']) => {
    const labels = {
      PREMIUM: 'Premium',
      TOP_ANNONCE: 'Top Annonce',
      URGENT: 'Urgent',
    };
    return labels[type];
  };

  const getForfaitTypeColor = (type: Payment['forfait']['type']) => {
    const colors = {
      PREMIUM: '#9333ea',
      TOP_ANNONCE: '#3b82f6',
      URGENT: '#ef4444',
    };
    return colors[type];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && payments.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement...
          </Text>
        </View>
      </View>
    );
  }

  if (!isLoading && payments.length === 0) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.emptyContainer}>
          <Icon name="card-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Aucun paiement
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Votre historique de paiements apparaîtra ici
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Historique des paiements
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {payments.length} paiement(s)
        </Text>
      </View>

      <View style={styles.paymentsList}>
        {payments.map((payment) => {
          const isActive = payment.status === 'SUCCESS' && payment.activeForfait && !payment.isExpired;
          const statusColor = getStatusColor(payment.status);
          const forfaitColor = getForfaitTypeColor(payment.forfait.type);

          return (
            <View
              key={payment.id}
              style={[
                styles.paymentCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* En-tête de la carte */}
              <View style={styles.cardHeader}>
                <View style={styles.productInfo}>
                  <Image
                    source={{
                      uri: getImageUrl(payment.product.images?.[0]) || PLACEHOLDER_IMAGE,
                    }}
                    style={styles.productImage}
                  />
                  <View style={styles.productDetails}>
                    <Text
                      style={[styles.productName, { color: colors.text }]}
                      numberOfLines={2}
                    >
                      {payment.product.name}
                    </Text>
                    <View style={styles.badgesRow}>
                      <View
                        style={[
                          styles.forfaitBadge,
                          { backgroundColor: `${forfaitColor}20` },
                        ]}
                      >
                        <Text style={[styles.forfaitBadgeText, { color: forfaitColor }]}>
                          {getForfaitTypeLabel(payment.forfait.type)}
                        </Text>
                      </View>
                      {isActive && (
                        <View style={styles.activeBadge}>
                          <Icon name="trending-up" size={12} color="#10b981" />
                          <Text style={styles.activeBadgeText}>Actif</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.statusContainer}>
                  <Icon name={getStatusIcon(payment.status)} size={24} color={statusColor} />
                  <Text style={[styles.amountText, { color: colors.text }]}>
                    {payment.amount.toLocaleString()} XAF
                  </Text>
                </View>
              </View>

              {/* Détails du paiement */}
              <View style={[styles.cardDetails, { borderTopColor: colors.border }]}>
                <View style={styles.detailRow}>
                  <Icon name="calendar-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                    Créé: {formatDate(payment.createdAt)}
                  </Text>
                </View>

                {payment.paidAt && (
                  <View style={styles.detailRow}>
                    <Icon name="checkmark-circle-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      Payé: {formatDate(payment.paidAt)}
                    </Text>
                  </View>
                )}

                {isActive && payment.activeForfait && (
                  <>
                    <View style={styles.detailRow}>
                      <Icon name="time-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        Reste: {payment.remainingDays} jour(s)
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="calendar-outline" size={16} color={colors.textSecondary} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        Expire: {formatDate(payment.activeForfait.expiresAt)}
                      </Text>
                    </View>

                    {/* Barre de progression */}
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${(payment.remainingDays! / payment.forfait.duration) * 100}%`,
                              backgroundColor: '#10b981',
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                        {payment.remainingDays}/{payment.forfait.duration} jours
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={() => fetchPayments(currentPage - 1)}
            disabled={currentPage === 1}
            style={[
              styles.paginationButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: currentPage === 1 ? 0.5 : 1,
              },
            ]}
          >
            <Text style={[styles.paginationButtonText, { color: colors.text }]}>
              Précédent
            </Text>
          </TouchableOpacity>

          <Text style={[styles.paginationText, { color: colors.textSecondary }]}>
            {currentPage} / {totalPages}
          </Text>

          <TouchableOpacity
            onPress={() => fetchPayments(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={[
              styles.paginationButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: currentPage === totalPages ? 0.5 : 1,
              },
            ]}
          >
            <Text style={[styles.paginationButtonText, { color: colors.text }]}>
              Suivant
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default PaymentHistory;
