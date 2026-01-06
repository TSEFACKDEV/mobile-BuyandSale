import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { getValidatedProductsAction } from '../../../store/product/actions';
import { getUserFavoritesAction } from '../../../store/favorite/actions';
import { selectUserAuthenticated } from '../../../store/authentification/slice';
import ProductCard from '../../../components/ProductCard';
import FilterModal from '../../../components/FilterModal';
import TopNavigation from '../../../components/TopNavigation';
import { useThemeColors } from '../../../contexts/ThemeContext';
import { getAllCategoriesAction } from '../../../store/category/actions';
import { fetchCitiesAction } from '../../../store/city/actions';
import styles from './style';

const Products = () => {
  const dispatch = useAppDispatch();
  const theme = useThemeColors();

  // Redux state
  const { validatedProducts, validatedProductsStatus, validatedProductsPagination } = useAppSelector(
    (state) => state.product
  );
  const { data: categories } = useAppSelector((state) => state.category);
  const { data: cities } = useAppSelector((state) => state.city);
  const authData = useAppSelector(selectUserAuthenticated);
  const isAuthenticated = authData.entities !== null;

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    search: string;
    categoryId?: string;
    cityId?: string;
    priceMin?: number;
    priceMax?: number;
    etat?: 'NEUF' | 'OCCASION' | 'CORRECT';
  }>({
    search: '',
  });

  // Charger les produits et favoris
  useEffect(() => {
    // Charger catégories et villes au montage
    dispatch(getAllCategoriesAction({ limit: 50 }));
    dispatch(fetchCitiesAction());
  }, []);

  useEffect(() => {
    loadProducts();
    if (isAuthenticated) {
      dispatch(getUserFavoritesAction());
    }
  }, [currentPage, filters]);

  const loadProducts = async () => {
    try {
      await dispatch(
        getValidatedProductsAction({
          page: currentPage,
          limit: 12,
          search: filters.search || undefined,
          categoryId: filters.categoryId,
          cityId: filters.cityId,
          priceMin: filters.priceMin,
          priceMax: filters.priceMax,
          etat: filters.etat,
        })
      ).unwrap();
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  // Trier les produits par priorité de forfait
  const sortedProducts = useMemo(() => {
    if (!validatedProducts) return [];

    const priorityMap: Record<string, number> = {
      PREMIUM: 1,
      TOP_ANNONCE: 2,
      URGENT: 3,
    };

    return [...validatedProducts].sort((a, b) => {
      const getForfaitPriority = (product: any) => {
        if (!product.productForfaits || product.productForfaits.length === 0) {
          return 999;
        }

        const now = new Date();
        const active = product.productForfaits.filter(
          (pf: any) => pf.isActive && new Date(pf.expiresAt) > now
        );

        if (active.length === 0) return 999;

        const priorities = active.map((pf: any) => priorityMap[pf.forfait.type] || 999);
        return Math.min(...priorities);
      };

      return getForfaitPriority(a) - getForfaitPriority(b);
    });
  }, [validatedProducts]);

  // Filtrer par recherche
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return sortedProducts;

    const query = searchQuery.toLowerCase();
    return sortedProducts.filter(
      (product) =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category.name.toLowerCase().includes(query)
    );
  }, [sortedProducts, searchQuery]);

  // Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await loadProducts();
    if (isAuthenticated) {
      await dispatch(getUserFavoritesAction());
    }
    await dispatch(getAllCategoriesAction({ limit: 50 }));
    await dispatch(fetchCitiesAction());
    setRefreshing(false);
  };

  // Recherche
  const handleSearch = () => {
    setCurrentPage(1);
    setFilters({ ...filters, search: searchQuery });
  };

  // Appliquer les filtres du modal
  const handleApplyFilters = (newFilters: typeof filters) => {
    setCurrentPage(1);
    setFilters(newFilters);
  };

  // Effacer tous les filtres
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({ search: '' });
    setCurrentPage(1);
  };

  // Compter les filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count++;
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

  // Render header
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.background }]}>
      {/* Barre de recherche */}
      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Rechercher un produit..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Statistiques et filtres */}
      <View style={styles.statsRow}>
        <View style={styles.leftStats}>
          <View style={styles.statItem}>
            <Ionicons name="cube-outline" size={18} color={theme.primary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>
              {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {activeFiltersCount > 0 && (
            <TouchableOpacity onPress={handleClearFilters}>
              <Text style={[styles.clearFiltersText, { color: theme.primary }]}>
                Effacer ({activeFiltersCount})
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter-outline" size={18} color={theme.primary} />
          <Text style={[styles.statText, { color: theme.primary }]}>Filtres</Text>
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render empty state
  const renderEmpty = () => {
    if (validatedProductsStatus === 'loading' && currentPage === 1) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color={theme.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucun produit trouvé</Text>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          {searchQuery
            ? `Aucun résultat pour "${searchQuery}"`
            : 'Aucun produit disponible pour le moment'}
        </Text>
        {searchQuery && (
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: theme.primary }]}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearButtonText}>Effacer la recherche</Text>
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
          Chargement...
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
          Chargement des produits...
        </Text>
      </View>
    );
  }

  // Error state
  if (validatedProductsStatus === 'failed') {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={[styles.errorTitle, { color: theme.text }]}>Erreur de chargement</Text>
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>
          Impossible de charger les produits
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          onPress={handleRefresh}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopNavigation />
      <FlatList
        ListHeaderComponent={renderHeader}
        data={filteredProducts}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id}
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
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={{ ...filters, search: searchQuery }}
        onApplyFilters={handleApplyFilters}
        categories={categories || []}
        cities={cities || []}
      />
    </View>
  );
};

export default Products;