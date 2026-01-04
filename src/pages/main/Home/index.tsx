import React, { useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
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
import { 
  selectValidatedProducts, 
  selectValidatedProductsStatus 
} from '../../../store/product/slice';
import { fetchCitiesAction } from '../../../store/city/actions';
import { fetchPublicSellersAction } from '../../../store/user/actions';

// Components
import TopNavigation from '../../../components/TopNavigation/TopNavigation';
import CategoryCard from '../../../components/CategoryCard';
import ProductCard from '../../../components/ProductHomeCard';
import SellerCard from '../../../components/SellerHomeCard';
import { Skeleton } from '../../../components/LoadingVariants';
import createStyles from './style';

const Home = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();

  // State from Redux
  const { data: categories, status: categoryStatus } = useAppSelector(state => state.category);
  const categoriesLoading = categoryStatus === 'PENDING';
  const validatedProducts = useAppSelector(selectValidatedProducts);
  const validatedProductsStatus = useAppSelector(selectValidatedProductsStatus);
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

  const loadInitialData = async (retryCount = 2) => {
    try {
      await Promise.all([
        dispatch(getAllCategoriesAction({ limit: 20 })).unwrap(),
        dispatch(getValidatedProductsAction({ page: 1, limit: 12 })).unwrap(),
        dispatch(fetchCitiesAction()).unwrap(),
        dispatch(fetchPublicSellersAction({ page: 1, limit: 10 })).unwrap(),
      ]);
    } catch (error: any) {
      console.error('❌ Erreur chargement données Home:', error);
      
      // Retry automatique en cas d'erreur réseau (max 2 tentatives)
      if (error?.message?.includes('Network') && retryCount < 2) {
        console.log(`🔄 Nouvelle tentative (${retryCount + 1}/2) dans 1 seconde...`);
        setTimeout(() => loadInitialData(retryCount + 1), 1000);
      }
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

  // Top vendeurs (limiter à 10) avec calcul des statistiques de reviews
  const topSellers = useMemo(() => {
    if (!publicSellers || publicSellers.length === 0) return [];
    
    // Calculer les stats de reviews pour chaque vendeur (comme le fait le backend pour le web)
    return publicSellers.slice(0, 10).map((seller: any) => {
      const reviews = seller.reviewsReceived || [];
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? Math.round((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews) * 10) / 10
        : 0;
      
      return {
        ...seller,
        totalReviews,
        averageRating,

      };
    });
  }, [publicSellers]);

  // Enrichir les catégories avec les icônes
  const enrichedCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return enrichCategoriesWithIcons(categories).slice(0, 20);
  }, [categories]);

  const styles = createStyles(theme);

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
          </View>

          {categoriesLoading ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <View key={index} style={{ marginRight: 12 }}>
                  <Skeleton width={80} height={80} borderRadius={12} />
                  <Skeleton width={80} height={14} borderRadius={4} style={{ marginTop: 8 }} />
                </View>
              ))}
            </ScrollView>
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
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsContainer}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <View key={index} style={{ marginRight: 12, width: 180 }}>
                  <Skeleton width={180} height={180} borderRadius={12} />
                  <Skeleton width={150} height={16} borderRadius={4} style={{ marginTop: 8 }} />
                  <Skeleton width={100} height={14} borderRadius={4} style={{ marginTop: 6 }} />
                  <Skeleton width={80} height={20} borderRadius={4} style={{ marginTop: 6 }} />
                </View>
              ))}
            </ScrollView>
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
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sellersContainer}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <View key={index} style={{ marginRight: 12, width: 160 }}>
                  <Skeleton width={160} height={200} borderRadius={12} />
                  <Skeleton width={120} height={16} borderRadius={4} style={{ marginTop: 8 }} />
                  <Skeleton width={80} height={14} borderRadius={4} style={{ marginTop: 6 }} />
                </View>
              ))}
            </ScrollView>
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