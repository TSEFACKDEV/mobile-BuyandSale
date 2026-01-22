import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { getValidatedProductsAction } from '../../../store/product/actions';
import { getUserFavoritesAction } from '../../../store/favorite/actions';
import { selectUserAuthenticated } from '../../../store/authentification/slice';
import ProductCard from '../../../components/ProductCard';
import FilterModal from '../../../components/FilterModal';
import TopNavigation from '../../../components/TopNavigation';
import { useThemeColors } from '../../../contexts/ThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { sortProductsByForfaitPriority } from '../../../config/forfaits.config';
import { getAllCategoriesAction } from '../../../store/category/actions';
import { fetchCitiesAction } from '../../../store/city/actions';
import styles from './style';

const Products = () => {
  const dispatch = useAppDispatch();
  const theme = useThemeColors();
  const { t, language } = useTranslation();
  const route = useRoute();
  const routeParams = route.params as { categoryId?: string } | undefined;

  // Redux state
  const validatedProducts = useAppSelector((state) => state.product.validatedProducts);
  const validatedProductsStatus = useAppSelector((state) => state.product.validatedProductsStatus);
  const validatedProductsPagination = useAppSelector((state) => state.product.validatedProductsPagination);
  const { data: categories } = useAppSelector((state) => state.category);
  const { data: cities } = useAppSelector((state) => state.city);
  const favoriteState = useAppSelector((state) => state.favorite);
  const authData = useAppSelector(selectUserAuthenticated);
  const isAuthenticated = authData.entities !== null;

  // Ref pour éviter les appels multiples pendant le chargement
  const isLoadingRef = useRef(false);
  const previousFiltersRef = useRef<string>('');

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    categoryId?: string;
    cityId?: string;
    priceMin?: number;
    priceMax?: number;
    etat?: 'NEUF' | 'OCCASION' | 'CORRECT';
  }>({});

  // Debounce pour la recherche (attend 500ms après la dernière saisie)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Charger catégories et villes seulement si elles ne sont pas déjà présentes
  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(getAllCategoriesAction({ limit: 50 }));
    }
    if (!cities || cities.length === 0) {
      dispatch(fetchCitiesAction());
    }
  }, [dispatch, categories, cities]);

  // Synchroniser le categoryId des params avec les filtres
  useEffect(() => {
    const categoryIdFromParams = routeParams?.categoryId;
    setFilters(prev => {
      // Ne mettre à jour que si c'est différent pour éviter les boucles
      if (prev.categoryId !== categoryIdFromParams) {
        return { ...prev, categoryId: categoryIdFromParams };
      }
      return prev;
    });
    setCurrentPage(1);
  }, [routeParams?.categoryId]);

  // Nettoyer les filtres quand on quitte la page
  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchQuery('');
        setCurrentPage(1);
        setFilters({});
      };
    }, [])
  );

  // Charger les produits quand page ou filtres changent
  useEffect(() => {
    // Créer une clé unique basée sur les filtres
    const filtersKey = JSON.stringify({ 
      page: currentPage, 
      categoryId: filters.categoryId, 
      cityId: filters.cityId, 
      priceMin: filters.priceMin, 
      priceMax: filters.priceMax, 
      etat: filters.etat 
    });

    // Si on a déjà des produits et que c'est le premier mount, initialiser la ref
    if (!previousFiltersRef.current && validatedProducts && validatedProducts.length > 0 && validatedProductsStatus === 'succeeded') {
      previousFiltersRef.current = filtersKey;
      return;
    }

    // Éviter les appels si les filtres n'ont pas changé et qu'on a déjà des produits chargés
    if (previousFiltersRef.current === filtersKey && 
        validatedProducts && 
        validatedProducts.length > 0 && 
        validatedProductsStatus === 'succeeded') {
      return;
    }

    // Éviter les appels multiples si un chargement est déjà en cours
    if (isLoadingRef.current || validatedProductsStatus === 'loading') {
      return;
    }

    const loadProducts = async () => {
      isLoadingRef.current = true;
      previousFiltersRef.current = filtersKey;
      
      try {
        await dispatch(
          getValidatedProductsAction({
            page: currentPage,
            limit: 12,
            categoryId: filters.categoryId,
            cityId: filters.cityId,
            priceMin: filters.priceMin,
            priceMax: filters.priceMax,
            etat: filters.etat,
          })
        ).unwrap();
      } catch (error) {
        console.error(t('products.loadingError'), error);
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadProducts();
  }, [currentPage, filters, validatedProducts, validatedProductsStatus, dispatch, t]);

  // Charger les favoris une seule fois si authentifié et pas déjà chargés
  useEffect(() => {
    if (isAuthenticated && favoriteState.status === 'idle') {
      dispatch(getUserFavoritesAction());
    }
  }, [isAuthenticated, favoriteState.status, dispatch]);

  // Mémoriser le renderItem pour éviter les re-renders du FlatList
  const renderItem = useCallback(
    ({ item }: { item: any }) => <ProductCard product={item} />,
    []
  );

  // Mémoriser le keyExtractor
  const keyExtractor = useCallback((item: any) => item.id, []);

  // Trier les produits par priorité de forfait
  const sortedProducts = useMemo(() => {
    if (!validatedProducts) return [];
    return sortProductsByForfaitPriority(validatedProducts);
  }, [validatedProducts]);


  // Filtrer par recherche
  const filteredProducts = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return sortedProducts;

    const query = debouncedSearchQuery.toLowerCase();
    return sortedProducts.filter(
      (product) =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category.name.toLowerCase().includes(query)
    );
  }, [sortedProducts, debouncedSearchQuery]);

  // Refresh
  const handleRefresh = () => {
    previousFiltersRef.current = ''; // Forcer le rechargement
    isLoadingRef.current = false;
    setCurrentPage(1); // Le useEffect rechargera automatiquement
  };

  // Appliquer les filtres du modal
  const handleApplyFilters = (newFilters: typeof filters) => {
    setCurrentPage(1);
    setFilters(newFilters);
  };

  // Effacer tous les filtres
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({});
    setCurrentPage(1);
  };

  // Compter les filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.cityId) count++;
    if (filters.priceMin !== undefined) count++;
    if (filters.priceMax !== undefined) count++;
    if (filters.etat) count++;
    return count;
  }, [filters]);

  // Pagination
  const handleLoadMore = () => {
    if (
      validatedProductsPagination?.nextPage &&
      validatedProductsStatus !== 'loading'
    ) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Render stats and filters (without search bar)
  const renderListHeader = useCallback(() => {
    const totalCount = validatedProductsPagination?.total || filteredProducts.length;
    return (
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        {/* Statistiques et filtres */}
        <View style={styles.statsRow}>
          <View style={styles.leftStats}>
            <View style={styles.statItem}>
              <Ionicons name="cube-outline" size={18} color={theme.primary} />
              <Text style={[styles.statText, { color: theme.textSecondary }]}>
                {totalCount} {totalCount !== 1 
                  ? (language === 'fr' ? 'résultats' : 'results')
                  : (language === 'fr' ? 'résultat' : 'result')}
              </Text>
            </View>
          </View>
          <View style={styles.actionButtons}>
            {activeFiltersCount > 0 && (
            <TouchableOpacity 
              onPress={handleClearFilters}
              style={[styles.clearFiltersButton, { backgroundColor: '#EF4444' }]}
            >
              <Ionicons name="close-circle" size={16} color="#FFFFFF" />
              <Text style={styles.clearFiltersButtonText}>
                {language === 'fr' ? `Effacer (${activeFiltersCount})` : `Clear (${activeFiltersCount})`}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter-outline" size={16} color="#FFFFFF" />
            <Text style={styles.filterButtonText}>{t('products.filters')}</Text>
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
    );
  }, [theme, validatedProductsPagination?.total, filteredProducts.length, activeFiltersCount, language, t]);

  // Render empty state
  const renderEmpty = () => {
    if (validatedProductsStatus === 'loading' && currentPage === 1) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color={theme.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('products.noProductsFound')}</Text>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          {searchQuery
            ? (language === 'fr' ? `Aucun résultat pour "${searchQuery}"` : `No results for "${searchQuery}"`)
            : t('products.noProductsAvailable')}
        </Text>
        {searchQuery && (
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: theme.primary }]}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearButtonText}>{t('products.clearSearch')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render footer (loading more)
  const renderFooter = () => {
    if (validatedProductsStatus !== 'loading' || currentPage === 1) {
      return null;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.primary} />
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          {t('products.loading')}
        </Text>
      </View>
    );
  };

  // Loading initial
  if (validatedProductsStatus === 'loading' && currentPage === 1) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          {t('products.loadingProducts')}
        </Text>
      </View>
    );
  }

  // Error state
  if (validatedProductsStatus === 'failed') {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={[styles.errorTitle, { color: theme.text }]}>{t('products.errorLoading')}</Text>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>
          {t('products.errorMessage')}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          onPress={handleRefresh}
        >
          <Text style={styles.retryButtonText}>{t('products.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopNavigation />
      
      {/* Barre de recherche fixe en dehors du FlatList */}
      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={t('products.searchPlaceholder')}
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        ListHeaderComponent={renderListHeader}
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={100}
        windowSize={10}
        initialNumToRender={12}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        categories={categories || []}
        cities={cities || []}
      />
    </View>
  );
};

export default Products;