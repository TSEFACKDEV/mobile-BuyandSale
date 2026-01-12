import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window');

const createStyles = (theme: any) => StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    // paddingVertical: 4,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },

  // Carousel
  carouselContainer: {
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  carouselScrollView: {
    width,
    height: 350,
  },
  carouselImage: {
    width,
    height: 350,
  },
  
  // Boutons overlay sur l'image
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    zIndex: 10,
  },
  overlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overlayActions: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnailsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
  },
  thumbnailButton: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2.5,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width,
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  placeholderText: {
    color: '#9CA3AF',
    marginTop: 6,
    fontSize: 13,
  },

  // Contenu
  content: {
    padding: 16,
  },

  // Badges
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  badgeCategory: {
    backgroundColor: '#FEF3C7',
  },
  badgeCity: {
    backgroundColor: '#E5E7EB',
  },
  badgeDate: {
    backgroundColor: '#D1FAE5',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Titre
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
    lineHeight: 26,
  },

  // Prix et Favoris
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EA580C',
  },
  favoriteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  favoriteButtonActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  favoriteButtonInactive: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },

  // Description
  descriptionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.textSecondary,
  },

  // Caractéristiques
  specsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  specsLeft: {
    flex: 1,
  },
  specItem: {
    marginBottom: 12,
  },
  specLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },

  // Avertissement sécurité
  warningBox: {
    flex: 1.5,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderLeftWidth: 3,
    borderLeftColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C2410C',
  },
  warningText: {
    fontSize: 11,
    color: '#9A3412',
    lineHeight: 17,
  },

  // Vendeur
  sellerContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  sellerAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  sellerRole: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // Boutons de contact
  contactButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  phoneButton: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  phoneButtonActive: {
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal plein écran
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalCounter: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCloseButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalImageWrapper: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width - 32,
    height: width - 32,
  },
  modalIndicators: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  modalIndicatorDot: {
    height: 8,
    borderRadius: 4,
  },

  // Error state
  errorContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  errorHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Spacing
  spacer: {
    height: 20,
  },
});

export default createStyles;