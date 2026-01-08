import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, TextInput, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../../contexts/ThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { fetchPublicSellersAction } from '../../../store/user/actions';
import { selectUsers, selectUsersStatus, selectUsersError } from '../../../store/user/slice';
import { LoadingType } from '../../../models/store';
import SellerCard from '../../../components/SellerCard';
import TopNavigation from '../../../components/TopNavigation';
import createStyles from './style';

const Sellers = () => {
  const colors = useThemeColors();
  const { t, language } = useTranslation();
  const dispatch = useAppDispatch();
  const styles = createStyles(colors);

  // États Redux (comme React)
  const sellers = useAppSelector(selectUsers);
  const status = useAppSelector(selectUsersStatus);
  const error = useAppSelector(selectUsersError);
  const pagination = useAppSelector((state) => state.user.pagination);

  // États locaux UI (EXACTEMENT comme React)
  const [localSearch, setLocalSearch] = useState(''); // Pour l'input immédiat
  const [searchFilter, setSearchFilter] = useState(''); // Équivalent de searchParams.get("search")
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Paramètres de filtrage (comme React - utilise searchFilter au lieu de localSearch)
  const filters = useMemo(
    () => ({
      search: searchFilter, // Comme searchParams.get("search")
      page: page,
      limit: 12,
    }),
    [searchFilter, page]
  );

  // Gestionnaire équivalent de handleFilterChange de React
  const handleFilterChange = useCallback((key: string, value: string) => {
    if (key === "search") {
      setSearchFilter(value.trim());
      setPage(1); // Reset page comme dans React
    }
  }, []);

  // Gestionnaire de recherche avec debounce (EXACTEMENT comme React)
  const handleSearchChange = (value: string) => {
    setLocalSearch(value); // Input immédiat

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      handleFilterChange("search", value); // Comme React
    }, 600);
  };

  const clearAllFilters = () => {
    setLocalSearch('');
    setSearchFilter(''); // Clear le filtre comme React
    setPage(1);
  };

  // Effect pour charger les vendeurs (EXACTEMENT comme React)
  useEffect(() => {
    dispatch(
      fetchPublicSellersAction({
        search: filters.search,
        page: filters.page,
        limit: filters.limit,
      })
    );
  }, [dispatch, filters.search, filters.page, filters.limit]);

  // Synchroniser localSearch avec filters (comme React)
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  // Nettoyage du timer au démontage (comme React)
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Gestionnaire de refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(
      fetchPublicSellersAction({
        search: filters.search,
        page: 1,
        limit: filters.limit,
      })
    );
    setRefreshing(false);
    setPage(1);
  }, [dispatch, filters.search, filters.limit]);

  // Gestionnaire de pagination
  const handleLoadMore = useCallback(() => {
    if (pagination && page < pagination.totalPages && status !== LoadingType.PENDING) {
      setPage(page + 1);
    }
  }, [pagination, page, status]);

  // Rendu du header avec recherche
  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('sellers.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={localSearch}
          onChangeText={handleSearchChange}
        />
        {localSearch !== '' && (
          <Icon
            name="close-circle"
            size={20}
            color={colors.textSecondary}
            onPress={clearAllFilters}
            style={styles.clearIcon}
          />
        )}
      </View>

      {/* Stats */}
      <Text style={styles.statsText}>
        {sellers.length} {language === 'fr' 
          ? (sellers.length !== 1 ? 'vendeurs trouvés' : 'vendeur trouvé')
          : (sellers.length !== 1 ? 'sellers found' : 'seller found')}
        {filters.search ? ` ${language === 'fr' ? 'pour' : 'for'} "${filters.search}"` : ''}
      </Text>
    </View>
  );

  // Rendu de l'état vide
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="people-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>{t('sellers.noSellersFound')}</Text>
      <Text style={styles.emptyText}>
        {filters.search
          ? (language === 'fr' 
              ? `Aucun vendeur ne correspond à "${filters.search}"`
              : `No seller matches "${filters.search}"`)
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
      <FlatList
        data={sellers}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item, index }) => (
          <View style={styles.cardWrapper}>
            <SellerCard seller={item} index={index} />
          </View>
        )}
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
        ListFooterComponent={
          status === LoadingType.PENDING && !refreshing && sellers.length > 0 ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Sellers;