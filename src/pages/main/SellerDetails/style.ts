import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../contexts/ThemeContext';

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
    },
    // Gradient Header (like React: bg-gradient-to-r from-orange-500 to-pink-500 h-48)
    gradientHeader: {
      height: 170, // h-48 = 12rem = 192px
      position: 'relative',
    },
    backButton: {
      position: 'absolute',
      top: 16,
      left: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    shareButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    // Profile Card (like React: -mt-24 negative margin)
    profileCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      marginTop: -96, // -mt-24 = -6rem = -96px (negative margin)
      marginHorizontal: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      marginBottom: 16,
    },
    // Avatar with double gradient border (like React: w-32 h-32)
    avatarGradient: {
      width: 128, // w-32 = 8rem = 128px
      height: 128,
      borderRadius: 64,
      padding: 4, // p-1 gradient border
      alignSelf: 'center',
      marginBottom: 16,
    },
    avatarContainer: {
      width: '100%',
      height: '100%',
      borderRadius: 60,
      overflow: 'hidden',
      backgroundColor: theme.border,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLetter: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#FFF',
    },
    // Seller Name
    sellerName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    // Info Row (Location + Calendar)
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginBottom: 16,
      paddingHorizontal: 8,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 8,
      marginVertical: 4,
      maxWidth: '45%',
    },
    infoText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 6,
      flexShrink: 1,
    },
    // Stats Row (Rating + Product Count)
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      marginBottom: 20,
    },
    productCount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    productCountText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    // Actions - Single Horizontal Row
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 16,
      marginBottom: 0,
    },
    actionButton: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      backgroundColor: theme.surface,
      minWidth: 95,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 1,
    },
    actionButtonText: {
      fontSize: 12,
      color: theme.text,
      fontWeight: '600',
      textAlign: 'center',
    },
    // Bouton WhatsApp (style ProductDetails)
    contactButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 8,
      gap: 6,
      backgroundColor: '#25D366',
      marginTop: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    contactButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    // Contact Section INSIDE profile card
    contactSection: {
      marginTop: 24,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    contactTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 16,
    },
    contactGrid: {
      gap: 12,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    contactText: {
      fontSize: 14,
      color: theme.text,
      flex: 1,
    },
    // Products Section - Separate Card
    productsCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      marginHorizontal: 10,
      padding: 10,
      marginBottom: 80, // Espace pour la bottom navigation
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    productsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    productsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'flex-start',
    },
    productItem: {
      width: '31.33%',
    },
    // Loading & Empty States
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 12,
    },
    loadMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      marginTop: 16,
      borderRadius: 8,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.primary,
      width: '100%',
    },
    loadMoreText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.primary,
    },
  });

export default createStyles;
