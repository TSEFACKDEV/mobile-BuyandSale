import React, { useEffect, useMemo, useState } from 'react';
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
import { fetchCitiesAction } from '../../../store/city/actions';
import { fetchPublicSellersAction } from '../../../store/user/actions';

// Components
import TopNavigation from '../../../components/TopNavigation';
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
  const homeProducts = useAppSelector(state => state.product.validatedProducts);
  const homeProductsStatus = useAppSelector(state => state.product.validatedProductsStatus);
  const productsLoading = homeProductsStatus === 'loading';
  const { data: cities, status: cityStatus } = useAppSelector(state => state.city);
  const citiesLoading = cityStatus === 'PENDING';
  const publicSellers = useAppSelector(state => state.user.users.entities);
  const publicSellersStatus = useAppSelector(state => state.user.users.status);
  const sellersLoading = publicSellersStatus === 'PENDING';
  const [refreshing, setRefreshing] = React.useState(false);

  // Charger les données au montage SEULEMENT si elles ne sont pas déjà présentes
  useEffect(() => {
    // Ne charger que si les données principales sont vides
    const needsInitialLoad = 
      !categories || categories.length === 0 ||
      !homeProducts || homeProducts.length === 0 ||
      !cities || cities.length === 0 ||
      !publicSellers || publicSellers.length === 0;

    if (needsInitialLoad) {
      loadInitialData();
    }
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
      // Retry automatique en cas d'erreur réseau (max 2 tentatives)
      if (error?.message?.includes('Network') && retryCount < 2) {
        setTimeout(() => loadInitialData(retryCount + 1), 1000);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  // Produits à la une (triés par priorité de forfait backend)
  const featuredProducts = useMemo(() => {
    if (!homeProducts || homeProducts.length === 0) return [];
    return homeProducts.slice(0, 12);
  }, [homeProducts]);

  // Top vendeurs avec calcul des statistiques de reviews
  const topSellers = useMemo(() => {
    if (!publicSellers || publicSellers.length === 0) return [];
    
    return publicSellers.slice(0, 10).map((seller: any) => {
      const reviews = seller.reviewsReceived || [];
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? Math.round((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews) * 10) / 10
        : 0;
      
      return {
        ...seller,
        totalReviews,
        averageRating
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
            <View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsContainer}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <View key={index} style={{ marginRight: 12, width: 180 }}>
                    <Skeleton width={180} height={180} borderRadius={12} />
                    <Skeleton width={150} height={16} borderRadius={4} style={{ marginTop: 8 }} />
                    <Skeleton width={100} height={14} borderRadius={4} style={{ marginTop: 6 }} />
                    <Skeleton width={80} height={20} borderRadius={4} style={{ marginTop: 6 }} />
                  </View>
                ))}
              </ScrollView>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.productsContainer, { marginTop: 12 }]}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <View key={index + 6} style={{ marginRight: 12, width: 180 }}>
                    <Skeleton width={180} height={180} borderRadius={12} />
                    <Skeleton width={150} height={16} borderRadius={4} style={{ marginTop: 8 }} />
                    <Skeleton width={100} height={14} borderRadius={4} style={{ marginTop: 6 }} />
                    <Skeleton width={80} height={20} borderRadius={4} style={{ marginTop: 6 }} />
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : featuredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="cube-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>{t('home.noProducts')}</Text>
            </View>
          ) : (
            <View>
              {/* Première ligne - 6 premiers produits */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsContainer}
              >
                {featuredProducts.slice(0, 6).map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ScrollView>
              
              {/* Deuxième ligne - 6 produits suivants */}
              {featuredProducts.length > 6 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[styles.productsContainer, { marginTop: 12 }]}
                >
                  {featuredProducts.slice(6, 12).map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </ScrollView>
              )}
            </View>
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
              <Text style={styles.emptyText}>{t('home.noSellers')}</Text>
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