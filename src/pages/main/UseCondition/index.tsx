import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
// import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useThemeColors } from '../../../contexts/ThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { styles } from './styles';

interface InfoCardProps {
  title: string;
  items: string[];
  bgColor: string;
  textColor: string;
  icon: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  items,
  bgColor,
  textColor,
  icon,
}) => (
  <View style={[styles.infoCard, { backgroundColor: bgColor }]}>
    <View style={styles.infoCardHeader}>
      <Icon name={icon} size={20} color={textColor} />
      <Text style={[styles.infoCardTitle, { color: textColor }]}>{title}</Text>
    </View>
    {items.map((item, index) => (
      <Text key={index} style={[styles.infoCardItem, { color: textColor }]}>
        {item}
      </Text>
    ))}
  </View>
);

const UseCondition: React.FC = () => {
  const { theme } = useTheme();
  const colors = useThemeColors();
  const { t } = useTranslation();

  const offeredServices = [
    t('terms.services.offered.freeAds') || '• Publication d\'annonces gratuites',
    t('terms.services.offered.searchFilters') ||
      '• Système de recherche et filtres',
    t('terms.services.offered.directContact') ||
      '• Contact direct avec les vendeurs',
    t('terms.services.offered.favorites') || '• Système de favoris',
  ];

  const notGuaranteedServices = [
    t('terms.services.notGuaranteed.productQuality') ||
      '• La qualité des produits vendus',
    t('terms.services.notGuaranteed.descriptionAccuracy') ||
      '• L\'exactitude des descriptions',
    t('terms.services.notGuaranteed.delivery') ||
      '• La livraison des commandes',
    t('terms.services.notGuaranteed.payment') ||
      '• Le paiement des transactions',
  ];

  const userObligations = [
    t('terms.obligations.user.accurateInfo') ||
      '• Fournir des informations exactes',
    t('terms.obligations.user.respectLaws') ||
      '• Respecter les lois camerounaises',
    t('terms.obligations.user.legalContent') ||
      '• Publier du contenu légal et approprié',
    t('terms.obligations.user.respectUsers') ||
      '• Respecter les autres utilisateurs',
    t('terms.obligations.user.secureAccount') || '• Sécuriser votre compte',
  ];

  const prohibitions = [
    t('terms.obligations.prohibited.illegalProducts') ||
      '• Vendre des produits illégaux',
    t('terms.obligations.prohibited.fakeIdentity') ||
      '• Utiliser de fausses identités',
    t('terms.obligations.prohibited.spam') || '• Faire du spam',
    t('terms.obligations.prohibited.hacking') ||
      '• Pirater ou attaquer le site',
    t('terms.obligations.prohibited.multipleFraudAccounts') ||
      '• Créer plusieurs comptes frauduleux',
  ];

  const userResponsibilities = [
    t('terms.liability.user.legalityVerification') ||
      '• Vérification de la légalité de vos annonces',
    t('terms.liability.user.descriptionAccuracy') ||
      '• Exactitude des descriptions de produits',
    t('terms.liability.user.buyerAgreements') ||
      '• Respect des accords avec les acheteurs',
    t('terms.liability.user.dataProtection') ||
      '• Protection de vos données personnelles',
  ];

  const ourResponsibilities = [
    t('terms.liability.our.platformProvision') ||
      '• Fourniture de la plateforme technique',
    t('terms.liability.our.dataProtection') ||
      '• Protection des données selon notre politique',
    t('terms.liability.our.contentModeration') ||
      '• Modération des contenus signalés',
    t('terms.liability.our.basicSupport') || '• Support technique de base',
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <Icon name="document-text-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>
            {t('terms.title') || 'Conditions d\'utilisation'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {t('terms.subtitle') ||
              'Règles et conditions d\'utilisation de la plateforme BuyAndSale.'}
          </Text>
          <View style={styles.lastUpdatedBadge}>
            <Icon name="calendar-outline" size={16} color={colors.primary} />
            <Text style={styles.lastUpdatedText}>
              {t('terms.lastUpdated') || 'Dernière mise à jour'} :{' '}
              {t('terms.lastUpdatedDate') || '15 mars 2026'}
            </Text>
          </View>
        </View>

        {/* Important Notice */}
        <View
          style={[
            styles.noticeCard,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.noticeHeader}>
            <Icon name="warning" size={24} color="#6B7280" />
            <Text style={[styles.noticeTitle, { color: colors.text }]}>
              {t('terms.important.title') || 'Important à retenir'}
            </Text>
          </View>
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            {t('terms.important.description') ||
              'En utilisant BuyAndSale, vous acceptez ces conditions dans leur intégralité.'}
          </Text>
        </View>

        {/* Section 1: Acceptation */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Icon name="checkbox-outline" size={24} color="#6B7280" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('terms.acceptance.title') || 'Acceptation des conditions'}
            </Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            {t('terms.acceptance.content.usage') ||
              'En utilisant BuyAndSale, vous acceptez ces conditions d\'utilisation dans leur intégralité.'}
          </Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            {t('terms.acceptance.content.application') ||
              'Ces conditions s\'appliquent à tous les utilisateurs de la plateforme.'}
          </Text>
        </View>

        {/* Section 2: Services */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Icon name="apps" size={24} color="#6B7280" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('terms.services.title') || 'Description des services'}
            </Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            {t('terms.services.description') ||
              'BuyAndSale est une plateforme de petites annonces en ligne destinée aux utilisateurs camerounais.'}
          </Text>
          <View style={styles.servicesGrid}>
            <InfoCard
              title={
                t('terms.services.offeredTitle') || '✓ Ce que nous offrons'
              }
              items={offeredServices}
              bgColor="#F9FAFB"
              textColor="#374151"
              icon="checkmark-circle"
            />
            <InfoCard
              title={
                t('terms.services.notGuaranteedTitle') ||
                '⚠️ Ce que nous ne garantissons pas'
              }
              items={notGuaranteedServices}
              bgColor="#F9FAFB"
              textColor="#374151"
              icon="alert-circle"
            />
          </View>
        </View>

        {/* Section 3: Obligations */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Icon name="people" size={24} color="#6B7280" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('terms.obligations.title') || 'Obligations des utilisateurs'}
            </Text>
          </View>
          <View style={styles.servicesGrid}>
            <InfoCard
              title={
                t('terms.obligations.userCommitments') ||
                '✅ Vous vous engagez à :'
              }
              items={userObligations}
              bgColor="#F9FAFB"
              textColor="#374151"
              icon="checkbox"
            />
            <InfoCard
              title={
                t('terms.obligations.prohibitions') || '❌ Il est interdit de :'
              }
              items={prohibitions}
              bgColor="#F9FAFB"
              textColor="#374151"
              icon="close-circle"
            />
          </View>
        </View>

        {/* Section 4: Responsabilités */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Icon name="lock-closed" size={24} color="#6B7280" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('terms.liability.title') || 'Responsabilités et limitations'}
            </Text>
          </View>
          <View style={styles.servicesGrid}>
            <InfoCard
              title={
                t('terms.liability.yourResponsibility') || 'Votre responsabilité'
              }
              items={userResponsibilities}
              bgColor="#F9FAFB"
              textColor="#374151"
              icon="person"
            />
            <InfoCard
              title={
                t('terms.liability.ourResponsibility') || 'Notre responsabilité'
              }
              items={ourResponsibilities}
              bgColor="#F9FAFB"
              textColor="#374151"
              icon="business"
            />
          </View>
          <View style={styles.warningCard}>
            <Icon name="alert-circle" size={20} color="#6B7280" />
            <Text style={styles.warningTitle}>
              {t('terms.liability.limitationTitle') ||
                '⚠️ Limitation de responsabilité'}
            </Text>
            <Text style={styles.warningText}>
              {t('terms.liability.limitationContent') ||
                'BuyAndSale ne peut être tenu responsable des transactions entre utilisateurs.'}
            </Text>
          </View>
        </View>

        {/* Section 5: Sanctions */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Icon name="close-circle" size={24} color="#6B7280" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('terms.sanctions.title') ||
                'Sanctions et mesures disciplinaires'}
            </Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            {t('terms.sanctions.introduction') ||
              'En cas de non-respect de ces conditions :'}
          </Text>
          <View style={styles.sanctionsCard}>
            <Text style={styles.sanctionsProgression}>
              {t('terms.sanctions.progression') ||
                '📢 Avertissement → ⏸️ Suspension → 🚫 Bannissement'}
            </Text>
            <Text style={styles.sanctionsDescription}>
              {t('terms.sanctions.description') ||
                'Sanctions progressives selon la gravité de l\'infraction'}
            </Text>
          </View>
        </View>

        {/* Section 6: Modifications */}
        <View style={styles.modificationsSection}>
          <Icon name="newspaper" size={40} color={colors.primary} />
          <Text style={styles.modificationsTitle}>
            {t('terms.modifications.title') || 'Modifications des conditions'}
          </Text>
          <Text style={styles.modificationsDescription}>
            {t('terms.modifications.description') ||
              'Nous nous réservons le droit de modifier ces conditions à tout moment.'}
          </Text>
          <View style={styles.modificationsInfoCard}>
            <Text style={styles.modificationsInfoTitle}>
              {t('terms.modifications.continuityTitle') ||
                'Continuité d\'utilisation = Acceptation'}
            </Text>
            <Text style={styles.modificationsInfoText}>
              {t('terms.modifications.continuityContent') ||
                'En continuant à utiliser BuyAndSale après modification des conditions, vous acceptez automatiquement les nouvelles conditions.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default UseCondition;