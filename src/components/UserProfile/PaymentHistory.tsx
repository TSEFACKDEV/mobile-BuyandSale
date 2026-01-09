import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../contexts/ThemeContext';
import { useTranslation } from '../../hooks/useTranslation';
import { FORFAIT_CONFIG } from '../../config/forfaits.config';
import API_ENDPOINTS from '../../helpers/api';
import API_CONFIG from '../../config/api.config';
import { getImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageUtils';
import { fetchWithAuth } from '../../utils/fetchWithAuth';
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
  userId: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ userId }) => {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayments = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchWithAuth(
        `${API_CONFIG.BASE_URL}/${API_ENDPOINTS.PAYMENT_GET_USER}?page=${page}&limit=10`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.meta?.message || t('userProfile.messages.error'));
      }
      
      const data = await response.json();

      if (data.success || data.data) {
        setPayments(data.data.payments || data.data);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setError(errorMessage);
      
      // Afficher un message à l'utilisateur
      if (Platform.OS === 'android') {
        ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
      } else {
        Alert.alert(t('userProfile.messages.error'), errorMessage);
      }
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

  // Mémoisation des configurations pour optimiser les performances
  const statusConfig = useMemo(() => ({
    icons: {
      SUCCESS: 'checkmark-circle',
      PENDING: 'time',
      FAILED: 'close-circle',
      CANCELLED: 'close-circle-outline',
      EXPIRED: 'alert-circle',
    },
    colors: {
      SUCCESS: '#10b981',
      PENDING: '#f59e0b',
      FAILED: '#ef4444',
      CANCELLED: '#6b7280',
      EXPIRED: '#f97316',
    },
    labels: {
      SUCCESS: t('userProfile.paymentHistory.statusSuccess'),
      PENDING: t('userProfile.paymentHistory.statusPending'),
      FAILED: t('userProfile.paymentHistory.statusFailed'),
      CANCELLED: t('userProfile.paymentHistory.statusCancelled'),
      EXPIRED: t('userProfile.paymentHistory.statusExpired'),
    },
  }), [t]);

  const getStatusIcon = useCallback((status: Payment['status']) => {
    return statusConfig.icons[status];
  }, [statusConfig]);

  const getStatusColor = useCallback((status: Payment['status']) => {
    return statusConfig.colors[status];
  }, [statusConfig]);

  const getStatusLabel = useCallback((status: Payment['status']) => {
    return statusConfig.labels[status];
  }, [statusConfig]);

  const getForfaitTypeLabel = useCallback((type: Payment['forfait']['type']) => {
    const config = FORFAIT_CONFIG[type];
    return config?.label || type;
  }, []);

  const getForfaitTypeColor = useCallback((type: Payment['forfait']['type']) => {
    const config = FORFAIT_CONFIG[type];
    return config?.badge.bgColor || '#6B7280';
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  if (isLoading && payments.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t('userProfile.paymentHistory.loading')}
          </Text>
        </View>
      </View>
    );
  }

  // Affichage en cas d'erreur persistante
  if (error && !isLoading && payments.length === 0) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.emptyContainer}>
          <Icon name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {t('userProfile.paymentHistory.loadingError')}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchPayments(1)}
            style={[
              styles.paginationButton,
              { backgroundColor: colors.primary, marginTop: 16, paddingHorizontal: 24 },
            ]}
          >
            <Text style={[styles.paginationButtonText, { color: '#FFFFFF' }]}>
              {t('userProfile.paymentHistory.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
            {t('userProfile.paymentHistory.noPayments')}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('userProfile.paymentHistory.noPaymentsDescription')}
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
          {t('userProfile.paymentHistory.title')}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {payments.length} {t('userProfile.paymentHistory.payments')}
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
              {/* En-tête compact */}
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
                      numberOfLines={1}
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
                    </View>
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                      {formatDate(payment.createdAt)}
                    </Text>
                  </View>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                    <Icon name={getStatusIcon(payment.status)} size={14} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {getStatusLabel(payment.status)}
                    </Text>
                  </View>
                  <Text style={[styles.amountText, { color: colors.text }]}>
                    {payment.amount.toLocaleString()} F
                  </Text>
                </View>
              </View>

              {/* Détails compacts pour paiements actifs uniquement */}
              {isActive && payment.activeForfait && payment.remainingDays !== undefined && (
                <View style={[styles.cardDetails, { borderTopColor: colors.border }]}>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                        {t('userProfile.paymentHistory.forfaitActive')}
                      </Text>
                      <Text style={[styles.progressDays, { color: payment.remainingDays < 7 ? '#f59e0b' : '#10b981' }]}>
                        {payment.remainingDays}{t('userProfile.paymentHistory.daysRemaining')}
                      </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(100, Math.max(0, (payment.remainingDays / payment.forfait.duration) * 100))}%`,
                            backgroundColor: payment.remainingDays < 7 ? '#f59e0b' : '#10b981',
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              )}
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
            accessible={true}
            accessibilityLabel={t('userProfile.paymentHistory.previousPage')}
            accessibilityRole="button"
            accessibilityState={{ disabled: currentPage === 1 }}
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
              {t('userProfile.paymentHistory.previousPage')}
            </Text>
          </TouchableOpacity>

          <Text 
            style={[styles.paginationText, { color: colors.textSecondary }]}
            accessible={true}
            accessibilityLabel={`Page ${currentPage} ${t('userProfile.paymentHistory.pageOf')} ${totalPages}`}
          >
            {currentPage} / {totalPages}
          </Text>

          <TouchableOpacity
            onPress={() => fetchPayments(currentPage + 1)}
            disabled={currentPage === totalPages}
            accessible={true}
            accessibilityLabel={t('userProfile.paymentHistory.nextPage')}
            accessibilityRole="button"
            accessibilityState={{ disabled: currentPage === totalPages }}
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
              {t('userProfile.paymentHistory.nextPage')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default PaymentHistory;
