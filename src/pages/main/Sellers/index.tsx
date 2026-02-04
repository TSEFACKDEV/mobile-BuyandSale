import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TextInput, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../../contexts/ThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { fetchPublicSellersAction } from '../../../store/user/actions';
import { selectUsers, selectUsersStatus, selectUsersError } from '../../../store/user/slice';
import { LoadingType } from '../../../models/store';
import SellerCard from '../../../components/SellerCard';
import TopNavigation from '../../../components/TopNavigation';
import BoostOfferModal from '../../../components/modals/BoostOfferModal';
import { useBoostReminder } from '../../../hooks/useBoostReminder';
import createStyles from './style';

const Sellers = () => {
  const colors = useThemeColors();
  const { t, language } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const styles = createStyles(colors);

  // Boost reminder
  const { shouldShow, productToBoost, handleAccept, handleDecline } = useBoostReminder();

  const handleBoostAccept = () => {
    handleAccept();
    navigation.navigate('HomeTab', {
      screen: 'UserProfile',
      params: { initialTab: 'ProductTab' },
    });
  };

  // États Redux (comme React)
  const sellers = useAppSelector(selectUsers);
  const status = useAppSelector(selectUsersStatus);
  const error = useAppSelector(selectUsersError);
  const pagination = useAppSelector((state) => state.user.pagination);

  // États locaux
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Debounce pour la recherche (attend 500ms après la dernière saisie)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filtrer les vendeurs par recherche
  const filteredSellers = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return sellers;

    const query = debouncedSearchQuery.toLowerCase();
    return sellers.filter(
      (seller) =>
        seller.firstName?.toLowerCase().includes(query) ||
        seller.lastName?.toLowerCase().includes(query) ||
        `${seller.firstName} ${seller.lastName}`.toLowerCase().includes(query)
    );
  }, [sellers, debouncedSearchQuery]);

  // Charger les vendeurs
  useEffect(() => {
    dispatch(
      fetchPublicSellersAction({
        page: page,
        limit: 12,
      })
    );
  }, [dispatch, page]);

  // Gestionnaire de refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await dispatch(
      fetchPublicSellersAction({
        page: 1,
        limit: 12,
      })
    );
    setRefreshing(false);
  }, [dispatch]);

  // Gestionnaire de pagination
  const handleLoadMore = useCallback(() => {
    if (pagination && page < pagination.totalPages && status !== LoadingType.PENDING) {
      setPage(page + 1);
    }
  }, [pagination, page, status]);

  // Mémoriser le renderItem pour éviter les re-renders du FlatList
  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <View style={styles.cardWrapper}>
        <SellerCard seller={item} index={index} />
      </View>
    ),
    [styles.cardWrapper]
  );

  // Mémoriser le keyExtractor
  const keyExtractor = useCallback((item: any) => item.id, []);

  // Optimisation: définir la hauteur fixe des items pour FlatList
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: 180, // hauteur approximative d'une carte vendeur
      offset: 180 * Math.floor(index / 2), // 2 colonnes
      index,
    }),
    []
  );

  // Rendu du header (stats uniquement)
  const renderListHeader = useCallback(() => (
    <View style={styles.header}>
      <Text style={styles.statsText}>
        {filteredSellers.length} {language === 'fr' 
          ? (filteredSellers.length !== 1 ? 'vendeurs trouvés' : 'vendeur trouvé')
          : (filteredSellers.length !== 1 ? 'sellers found' : 'seller found')}
      </Text>
    </View>
  ), [filteredSellers.length, language, styles]);

  // Rendu de l'état vide
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="people-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>{t('sellers.noSellersFound')}</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? (language === 'fr' 
              ? `Aucun vendeur ne correspond à "${searchQuery}"`
              : `No seller matches "${searchQuery}"`)
          : t('sellers.noSellersAvailable')}
      </Text>
    </View>
  );

  // Rendu du loading initial
  if (status === LoadingType.PENDING && !refreshing && sellers.length === 0) {
    return (
      <View style={styles.container}>
        <TopNavigation />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('sellers.loadingSellers')}</Text>
        </View>
      </View>
    );
  }

  // Rendu de l'erreur
  if (status === LoadingType.FAILED && !refreshing && sellers.length === 0) {
    return (
      <View style={styles.container}>
        <TopNavigation />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>{t('sellers.errorLoading')}</Text>
          <Text style={styles.errorText}>
            {error?.meta?.message || t('sellers.errorMessage')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNavigation />
      
      {/* Barre de recherche fixe en dehors du FlatList */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('sellers.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery !== '' && (
          <Icon
            name="close-circle"
            size={20}
            color={colors.textSecondary}
            onPress={() => setSearchQuery('')}
            style={styles.clearIcon}
          />
        )}
      </View>

      <FlatList
        data={filteredSellers}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={100}
        windowSize={10}
        initialNumToRender={12}
        ListFooterComponent={
          status === LoadingType.PENDING && !refreshing && sellers.length > 0 ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
      />

      {/* Modal de suggestion de boost */}
      {shouldShow && productToBoost && (
        <BoostOfferModal
          visible={shouldShow}
          product={productToBoost}
          onAccept={handleBoostAccept}
          onDecline={handleDecline}
        />
      )}
    </View>
  );
};

export default Sellers;