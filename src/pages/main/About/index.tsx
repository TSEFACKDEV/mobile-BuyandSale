import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useThemeColors } from '../../../contexts/ThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_CONFIG } from '../../../config/api.config';
import { styles } from './styles';

const { width } = Dimensions.get('window');

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  colors: any;
}

interface FeatureCardProps {
  title: string;
  description: string;
  colors: any;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, colors }) => (
  <View style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
    <View
      style={[
        styles.statIconContainer,
        { backgroundColor: colors.primary + '20' },
      ]}
    >
      <Icon name={icon} size={24} color={colors.primary} />
    </View>
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
      {label}
    </Text>
  </View>
);

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  colors,
}) => (
  <View
    style={[
      styles.featureCard,
      {
        backgroundColor: colors.backgroundSecondary,
        borderColor: colors.border,
      },
    ]}
  >
    <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
    <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
      {description}
    </Text>
  </View>
);

const About: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { theme } = useTheme();
  const colors = useThemeColors();
  const { t } = useTranslation();

  const [stats, setStats] = useState([
    {
      icon: 'people',
      value: '...',
      label: t('about.stats.activeUsers') || 'Utilisateurs actifs',
    },
    {
      icon: 'star',
      value: '...',
      label: t('about.stats.publishedAds') || 'Annonces publiées',
    },
    {
      icon: 'shield-checkmark',
      value: '...',
      label: t('about.stats.secureTransactions') || 'Transactions sécurisées',
    },
    {
      icon: 'globe',
      value: '...',
      label: t('about.stats.coveredCities') || 'Villes couvertes',
    },
  ]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/stats/platform`);
      const result = await response.json();

      if (result.success && result.data) {
        const { users, products, successRate, cities } = result.data;
        
        setStats([
          {
            icon: 'people',
            value: formatNumber(users),
            label: t('about.stats.activeUsers') || 'Utilisateurs actifs',
          },
          {
            icon: 'star',
            value: formatNumber(products),
            label: t('about.stats.publishedAds') || 'Annonces publiées',
          },
          {
            icon: 'shield-checkmark',
            value: `${successRate}%`,
            label: t('about.stats.secureTransactions') || 'Transactions sécurisées',
          },
          {
            icon: 'globe',
            value: `${cities}+`,
            label: t('about.stats.coveredCities') || 'Villes couvertes',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      // Keep default loading values if fetch fails
    } finally {
      setIsLoadingStats(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      const thousands = Math.floor(num / 1000);
      return `${thousands},${String(num % 1000).padStart(3, '0')}+`;
    }
    return `${num}+`;
  };

  const features = [
    {
      title:
        t('about.features.list.easeOfUse.title') || 'Simplicité d\'utilisation',
      description:
        t('about.features.list.easeOfUse.description') ||
        'Interface intuitive pour publier et rechercher des annonces en quelques clics.',
    },
    {
      title: t('about.features.list.security.title') || 'Sécurité garantie',
      description:
        t('about.features.list.security.description') ||
        'Vérification des utilisateurs et système de signalement pour votre sécurité.',
    },
    {
      title: t('about.features.list.localSupport.title') || 'Support local',
      description:
        t('about.features.list.localSupport.description') ||
        'Conçu spécialement pour le marché camerounais avec support en français.',
    },
    {
      title:
        t('about.features.list.freeAccess.title') || 'Gratuit et accessible',
      description:
        t('about.features.list.freeAccess.description') ||
        'Publication gratuite d\'annonces et accès libre pour tous les utilisateurs.',
    },
  ];

  const reasons = [
    {
      icon: 'shield-checkmark',
      text: t('about.mission.reasons.secure') || 'Plateforme 100% sécurisée',
    },
    {
      icon: 'people',
      text:
        t('about.mission.reasons.community') || 'Communauté active et engagée',
    },
    {
      icon: 'headset',
      text: t('about.mission.reasons.support') || 'Service client réactif',
    },
    {
      icon: 'globe',
      text: t('about.mission.reasons.coverage') || 'Couverture nationale',
    },
  ];

  const handleContactPress = () => {
    navigation.navigate('Contact');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#FF6B35', '#FF8C42']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroIconContainer}>
            <Icon name="information-circle" size={48} color="#FFF" />
          </View>
          <Text style={styles.heroTitle}>
            {t('about.hero.title') || 'À propos de nous'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {t('about.hero.subtitle') ||
              'La plateforme de petites annonces qui connecte les Camerounais pour acheter, vendre et échanger en toute confiance.'}
          </Text>
        </LinearGradient>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('about.mission.title') || 'Notre Mission'}
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            {t('about.mission.description1') ||
              'Nous croyons que chaque Camerounais devrait avoir accès à une plateforme simple, sécurisée et efficace pour vendre ses biens ou trouver ce qu\'il cherche.'}
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            {t('about.mission.description2') ||
              'Notre objectif est de démocratiser le commerce en ligne au Cameroun en proposant une solution adaptée aux besoins locaux.'}
          </Text>

          {/* Why Choose Us Card */}
          <LinearGradient
            colors={['#FF6B35', '#FF8C42']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.whyChooseCard}
          >
            <Text style={styles.whyChooseTitle}>
              {t('about.mission.whyChooseUs') || 'Pourquoi nous choisir ?'}
            </Text>
            {reasons.map((reason, index) => (
              <View key={index} style={styles.reasonItem}>
                <Icon name={reason.icon} size={20} color="#FFF" />
                <Text style={styles.reasonText}>{reason.text}</Text>
              </View>
            ))}
          </LinearGradient>
        </View>

        {/* Stats Section */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.backgroundSecondary, marginHorizontal: 0 },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, textAlign: 'center' },
            ]}
          >
            {t('about.stats.title') || 'Nos chiffres parlent d\'eux-mêmes'}
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: colors.textSecondary, textAlign: 'center' },
            ]}
          >
            {t('about.stats.subtitle') ||
              'Une croissance constante grâce à la confiance de nos utilisateurs'}
          </Text>
          {isLoadingStats ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} colors={colors} />
              ))}
            </View>
          )}
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, textAlign: 'center' },
            ]}
          >
            {t('about.features.title') || 'Ce qui nous distingue'}
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: colors.textSecondary, textAlign: 'center' },
            ]}
          >
            {t('about.features.subtitle') ||
              'Des fonctionnalités pensées pour l\'expérience utilisateur camerounaise'}
          </Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} colors={colors} />
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <LinearGradient
          colors={['#FF6B35', '#FF8C42']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaSection}
        >
          <Text style={styles.ctaTitle}>
            {t('about.cta.title') || 'Prêt à nous rejoindre ?'}
          </Text>
          <Text style={styles.ctaSubtitle}>
            {t('about.cta.subtitle') ||
              'Rejoignez des milliers de Camerounais qui font confiance à notre plateforme.'}
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleContactPress}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>
              {t('about.cta.contactUs') || 'Nous contacter'}
            </Text>
            <Icon name="mail" size={20} color="#FF6B35" />
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

export default About;