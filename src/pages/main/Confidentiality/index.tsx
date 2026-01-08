import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useThemeColors } from '../../../contexts/ThemeContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { styles } from './styles';

interface DataCardProps {
  icon: string;
  title: string;
  items: string[];
  colors: any;
}

const DataCard: React.FC<DataCardProps> = ({ icon, title, items, colors }) => (
  <View
    style={[
      styles.dataCard,
      {
        backgroundColor: colors.backgroundSecondary,
        borderColor: colors.border,
      },
    ]}
  >
    <View style={styles.dataCardHeader}>
      <View
        style={[
          styles.dataCardIconContainer,
          { backgroundColor: colors.primary + '20' },
        ]}
      >
        <Icon name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.dataCardTitle, { color: colors.text }]}>
        {title}
      </Text>
    </View>
    {items.map((item, index) => (
      <View key={index} style={styles.dataItem}>
        <View style={styles.bulletPoint} />
        <Text style={[styles.dataItemText, { color: colors.textSecondary }]}>
          {item}
        </Text>
      </View>
    ))}
  </View>
);

const Confidentiality: React.FC = () => {
  const { theme } = useTheme();
  const colors = useThemeColors();
  const { t } = useTranslation();

  const personalInfo = [
    t('privacy.content.personal.identity') ||
      'Identité : Nom, prénom lors de l\'inscription',
    t('privacy.content.personal.contact') ||
      'Contact : Adresse email et numéro de téléphone camerounais (+237)',
    t('privacy.content.personal.avatar') ||
      'Photo de profil : Avatar optionnel que vous uploadez',
  ];

  const productsInfo = [
    t('privacy.content.products.images') ||
      'Images de vos produits (maximum 5 par annonce)',
    t('privacy.content.products.descriptions') ||
      'Descriptions, prix, quantités et état des produits',
    t('privacy.content.products.location') ||
      'Localisation (ville et quartier au Cameroun)',
    t('privacy.content.products.phone') ||
      'Numéro de téléphone pour contact direct',
  ];

  const technicalInfo = [
    t('privacy.content.technical.connection') ||
      'Informations de connexion et de navigation',
    t('privacy.content.technical.session') ||
      'Données de session pour la sécurité',
    t('privacy.content.technical.preferences') ||
      'Préférences d\'utilisation (langue, thème, favoris)',
  ];

  const technicalProtection = [
    t('privacy.content.protection.technical.encryption') ||
      'Chiffrement avancé des mots de passe',
    t('privacy.content.protection.technical.connections') ||
      'Connexions sécurisées',
    t('privacy.content.protection.technical.auth') ||
      'Système d\'authentification robuste',
    t('privacy.content.protection.technical.infrastructure') ||
      'Infrastructure sécurisée',
    t('privacy.content.protection.technical.validation') ||
      'Validation par code de vérification',
  ];

  const accessControl = [
    t('privacy.content.protection.access.control') ||
      'Contrôle d\'accès strict aux données',
    t('privacy.content.protection.access.admin') || 'Administration sécurisée',
    t('privacy.content.protection.access.monitoring') ||
      'Surveillance des activités',
    t('privacy.content.protection.access.reporting') ||
      'Système de signalement intégré',
    t('privacy.content.protection.access.moderation') ||
      'Modération active des contenus',
  ];

  const handleContactPress = () => {
    const email = 'contact@buyandsale.cm';
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#FF6B35', '#F97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroIconContainer}>
            <Icon name="shield-checkmark" size={48} color="#FFF" />
          </View>
          <Text style={styles.heroTitle}>
            {t('privacy.title') || 'Politique de confidentialité'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {t('privacy.subtitle') ||
              'Votre confidentialité est notre priorité. Découvrez comment nous collectons, utilisons et protégeons vos données personnelles.'}
          </Text>
          <View style={styles.lastUpdatedBadge}>
            <Icon name="time-outline" size={16} color="#FFF" />
            <Text style={styles.lastUpdatedText}>
              {t('privacy.lastUpdated') || 'Dernière mise à jour'} :{' '}
              {t('privacy.lastUpdatedDate') || '2 septembre 2025'}
            </Text>
          </View>
        </LinearGradient>

        {/* Summary Card */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.summaryHeader}>
            <Icon name="file-tray-outline" size={24} color="#6B7280" />
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              {t('privacy.summary.title') || 'Résumé en bref'}
            </Text>
          </View>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            {t('privacy.summary.description') ||
              'BuyAndSale collecte uniquement les données nécessaires au fonctionnement de notre marketplace camerounaise. Vos informations personnelles ne sont jamais vendues à des tiers et restent sécurisées par des technologies de pointe.'}
          </Text>
        </View>

        {/* Section 1: Collecte d'informations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="folder-outline" size={26} color="#6B7280" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('privacy.collection.title') || 'Collecte d\'informations'}
            </Text>
          </View>
          <DataCard
            icon="person"
            title={
              t('privacy.collection.personal.title') ||
              'Informations personnelles'
            }
            items={personalInfo}
            colors={colors}
          />
          <DataCard
            icon="pricetag"
            title={
              t('privacy.collection.products.title') ||
              'Informations sur vos produits'
            }
            items={productsInfo}
            colors={colors}
          />
          <DataCard
            icon="analytics"
            title={
              t('privacy.collection.technical.title') ||
              'Informations techniques'
            }
            items={technicalInfo}
            colors={colors}
          />
        </View>

        {/* Section 2: Utilisation des données */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.backgroundSecondary,
              marginHorizontal: 0,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Icon name="settings-outline" size={26} color="#6B7280" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('privacy.usage.title') || 'Utilisation de vos données'}
            </Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Vos données sont utilisées pour :
          </Text>
          <View style={styles.usageList}>
            <View style={styles.usageItem}>
              <Icon name="checkmark-circle" size={20} color="#10B981" />
              <Text style={[styles.usageText, { color: colors.textSecondary }]}>
                Authentification et sécurisation des comptes
              </Text>
            </View>
            <View style={styles.usageItem}>
              <Icon name="checkmark-circle" size={20} color="#10B981" />
              <Text style={[styles.usageText, { color: colors.textSecondary }]}>
                Affichage des annonces et mise en relation
              </Text>
            </View>
            <View style={styles.usageItem}>
              <Icon name="checkmark-circle" size={20} color="#10B981" />
              <Text style={[styles.usageText, { color: colors.textSecondary }]}>
                Gestion des favoris et notifications
              </Text>
            </View>
            <View style={styles.usageItem}>
              <Icon name="checkmark-circle" size={20} color="#10B981" />
              <Text style={[styles.usageText, { color: colors.textSecondary }]}>
                Support client et assistance
              </Text>
            </View>
          </View>
        </View>

        {/* Section 3: Partage des données */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="people" size={26} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('privacy.sharing.title') || 'Partage des données'}
            </Text>
          </View>
          <View style={styles.sharingCard}>
            <View style={[styles.sharingGood, { borderColor: '#10B981' }]}>
              <Icon name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.sharingGoodTitle}>
                ✓ {t('privacy.sharing.public.title') || 'Informations publiques'}
              </Text>
              <Text style={styles.sharingGoodText}>
                {t('privacy.content.sharing.public.description') ||
                  'Seuls votre nom, prénom et numéro de téléphone sont visibles publiquement sur vos annonces pour permettre aux acheteurs de vous contacter.'}
              </Text>
            </View>
            <View style={[styles.sharingBad, { borderColor: '#EF4444' }]}>
              <Icon name="close-circle" size={24} color="#EF4444" />
              <Text style={styles.sharingBadTitle}>
                ✗{' '}
                {t('privacy.sharing.notShared.title') || 'Informations privées'}
              </Text>
              <Text style={styles.sharingBadText}>
                • Votre adresse email n'est jamais partagée{'\n'}• Vos données ne
                sont pas vendues à des tiers{'\n'}• Pas de partage avec des
                réseaux sociaux{'\n'}• Aucune utilisation publicitaire externe
              </Text>
            </View>
          </View>
        </View>

        {/* Section 4: Protection des données */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.backgroundSecondary,
              marginHorizontal: 0,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Icon name="lock-closed" size={26} color="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('privacy.protection.title') || 'Protection des données'}
            </Text>
          </View>
          <DataCard
            icon="shield-half"
            title={
              t('privacy.protection.technical.title') || 'Sécurité technique'
            }
            items={technicalProtection}
            colors={colors}
          />
          <DataCard
            icon="key"
            title={t('privacy.protection.access.title') || 'Contrôle d\'accès'}
            items={accessControl}
            colors={colors}
          />
        </View>

        {/* Section 5: Vos droits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="hand-right" size={26} color="#10B981" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('privacy.rights.title') || 'Vos droits'}
            </Text>
          </View>
          <View style={styles.rightsList}>
            <View style={styles.rightItem}>
              <View style={styles.rightIconContainer}>
                <Icon name="eye" size={18} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rightTitle, { color: colors.text }]}>
                  {t('privacy.rights.access.title') || 'Droit d\'accès'}
                </Text>
                <Text
                  style={[styles.rightDescription, { color: colors.textSecondary }]}
                >
                  Consultez toutes vos données dans votre profil utilisateur
                </Text>
              </View>
            </View>
            <View style={styles.rightItem}>
              <View style={styles.rightIconContainer}>
                <Icon name="pencil" size={18} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rightTitle, { color: colors.text }]}>
                  {t('privacy.rights.modification.title') ||
                    'Droit de rectification'}
                </Text>
                <Text
                  style={[styles.rightDescription, { color: colors.textSecondary }]}
                >
                  Modifiez vos informations personnelles à tout moment
                </Text>
              </View>
            </View>
            <View style={styles.rightItem}>
              <View style={styles.rightIconContainer}>
                <Icon name="trash" size={18} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rightTitle, { color: colors.text }]}>
                  {t('privacy.rights.deletion.title') || 'Droit à l\'effacement'}
                </Text>
                <Text
                  style={[styles.rightDescription, { color: colors.textSecondary }]}
                >
                  Supprimez votre compte et toutes vos données
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <LinearGradient
          colors={['#FF6B35', '#F97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contactSection}
        >
          <Icon name="mail" size={40} color="#FFF" />
          <Text style={styles.contactTitle}>
            {t('privacy.contact.title') || 'Nous contacter'}
          </Text>
          <Text style={styles.contactDescription}>
            {t('privacy.contact.description') ||
              'Des questions sur notre politique de confidentialité ? Notre équipe est là pour vous aider.'}
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactPress}
            activeOpacity={0.8}
          >
            <Text style={styles.contactButtonText}>
              contact@buyandsale.cm
            </Text>
            <Icon name="arrow-forward" size={20} color="#FF6B35" />
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

export default Confidentiality;