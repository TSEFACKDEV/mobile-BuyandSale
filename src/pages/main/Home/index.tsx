import React, { useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { useTranslation } from '../../../hooks/useTranslation';
import { enrichCategoriesWithIcons } from '../../../utils/categoryHelpers';

// Actions
import { getAllCategoriesAction } from '../../../store/category/actions';
import { getValidatedProductsAction } from '../../../store/product/actions';
import { fetchCitiesAction } from '../../../store/city/actions';
import { fetchPublicSellersAction } from '../../../store/user/actions';

// Components
import TopNavigation from '../../../components/TopNavigation/TopNavigation';
import CategoryCard from '../../../components/CategoryCard';
import ProductCard from '../../../components/ProductCard';
import SellerCard from '../../../components/SellerCard';

const Home = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();

  // State from Redux
  const { data: categories, status: categoryStatus } = useAppSelector(state => state.category);
  const categoriesLoading = categoryStatus === 'PENDING';
  const { validatedProducts, validatedProductsStatus } = useAppSelector(state => state.product);
  const productsLoading = validatedProductsStatus === 'loading';
  const { data: cities, status: cityStatus } = useAppSelector(state => state.city);
  const citiesLoading = cityStatus === 'PENDING';
  const { sellers: publicSellers, sellersStatus: publicSellersStatus } = useAppSelector(state => state.user);
  const sellersLoading = publicSellersStatus === 'PENDING';
  const [refreshing, setRefreshing] = React.useState(false);

  // Charger les données au montage
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        dispatch(getAllCategoriesAction()).unwrap(),
        dispatch(getValidatedProductsAction({ page: 1, limit: 12 })).unwrap(),
        dispatch(fetchCitiesAction()).unwrap(),
        dispatch(fetchPublicSellersAction({ page: 1, limit: 10 })).unwrap(),
      ]);
    } catch (error) {
      // Erreur silencieuse
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  // Produits à la une (déjà triés par le backend par priorité de forfait)
  // Backend: PREMIUM (1) > TOP_ANNONCE (2) > URGENT (3) > Sans forfait
  const featuredProducts = useMemo(() => {
    if (!validatedProducts || validatedProducts.length === 0) return [];
    // Le backend retourne déjà les produits triés par priorité de forfait
    // On limite juste à 12 produits pour la page d'accueil
    return validatedProducts.slice(0, 12);
  }, [validatedProducts]);

  // Top vendeurs (limiter à 10)
  const topSellers = useMemo(() => {
    return publicSellers?.slice(0, 10) || [];
  }, [publicSellers]);

  // Enrichir les catégories avec les icônes
  const enrichedCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return enrichCategoriesWithIcons(categories).slice(0, 10);
  }, [categories]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: 80,
    },
    // Hero Section - Comme la version web
    heroSection: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 20,
      alignItems: 'center',
    },
    heroTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 8,
      lineHeight: 28,
    },
    heroSubtitle: {
      fontSize: 13,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 18,
    },
    section: {
      marginTop: 20,
      paddingHorizontal: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },
    seeAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    seeAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    categoriesContainer: {
      paddingLeft: 16,
    },
    productsContainer: {
      paddingLeft: 16,
    },
    sellersContainer: {
      paddingLeft: 16,
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    howItWorksSection: {
      marginTop: 20,
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
    },
    howItWorksHeader: {
      alignItems: 'center',
      marginBottom: 16,
    },
    howItWorksTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    howItWorksSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    stepsContainer: {
      gap: 12,
    },
    stepCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    stepIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    stepDescription: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      lineHeight: 15,
    },
  });

  return (
    <View style={styles.container}>
      <TopNavigation />
      
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Section - Exactement comme le web */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>{t('hero.title')}</Text>
          <Text style={styles.heroSubtitle}>{t('hero.subtitle')}</Text>
        </View>

        {/* Catégories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.allCategories')}</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => (navigation as any).navigate('Categories')}
            >
              <Text style={styles.seeAllText}>{t('home.seeAll')}</Text>
              <Icon name="chevron-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {categoriesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>{t('home.loadingCategories')}</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {enrichedCategories.map((category: any) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Annonces à la Une */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.featuredAds')}</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => (navigation as any).navigate('Products')}
            >
              <Text style={styles.seeAllText}>{t('home.seeAll')}</Text>
              <Icon name="chevron-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {productsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>{t('home.loadingProducts')}</Text>
            </View>
          ) : featuredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="cube-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>{t('home.noProducts')}</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsContainer}
            >
              {featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Vendeurs à la Une */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.topSellers')}</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => (navigation as any).navigate('Sellers')}
            >
              <Text style={styles.seeAllText}>{t('home.seeAll')}</Text>
              <Icon name="chevron-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {sellersLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>{t('home.loading')}</Text>
            </View>
          ) : topSellers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="people-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>Aucun vendeur disponible</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sellersContainer}
            >
              {topSellers.map((seller: any) => (
                <SellerCard key={seller.id} seller={seller} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Comment ça marche */}
        <View style={styles.howItWorksSection}>
          <View style={styles.howItWorksHeader}>
            <Text style={styles.howItWorksTitle}>{t('howItWorks.title')}</Text>
            <Text style={styles.howItWorksSubtitle}>{t('howItWorks.subtitle')}</Text>
          </View>

          <View style={styles.stepsContainer}>
            {/* Étape 1 */}
            <View style={styles.stepCard}>
              <View style={styles.stepIconContainer}>
                <Icon name="person-add" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{t('howItWorks.step1.title')}</Text>
                <Text style={styles.stepDescription}>{t('howItWorks.step1.description')}</Text>
              </View>
            </View>

            {/* Étape 2 */}
            <View style={styles.stepCard}>
              <View style={styles.stepIconContainer}>
                <Icon name="trending-up" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{t('howItWorks.step2.title')}</Text>
                <Text style={styles.stepDescription}>{t('howItWorks.step2.description')}</Text>
              </View>
            </View>

            {/* Étape 3 */}
            <View style={styles.stepCard}>
              <View style={styles.stepIconContainer}>
                <Icon name="shield-checkmark" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{t('howItWorks.step3.title')}</Text>
                <Text style={styles.stepDescription}>{t('howItWorks.step3.description')}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;