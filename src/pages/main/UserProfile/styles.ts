import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },

  // Header Section
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerDark: {
    backgroundColor: '#1F2937',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    marginRight: 16,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userNameDark: {
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userEmailDark: {
    color: '#9CA3AF',
  },
  userLocation: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 8,
  },
  userLocationDark: {
    color: '#D1D5DB',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  ratingValueDark: {
    color: '#FFFFFF',
  },
  ratingCount: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  ratingCountDark: {
    color: '#9CA3AF',
  },
  memberSince: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  memberSinceDark: {
    borderTopColor: '#374151',
  },
  memberSinceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  memberSinceLabelDark: {
    color: '#9CA3AF',
  },
  memberSinceDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  memberSinceDateDark: {
    color: '#FFFFFF',
  },

  // Tabs Section
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabsContainerDark: {
    backgroundColor: '#1F2937',
  },
  tabsList: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 4,
  },
  tabsListDark: {
    borderBottomColor: '#374151',
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    minWidth: 70,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  tabTextDark: {
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeDark: {
    backgroundColor: '#374151',
  },
  tabBadgeActive: {
    backgroundColor: '#DBEAFE',
  },
  tabBadgeActiveDark: {
    backgroundColor: '#1E3A8A',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  tabBadgeTextDark: {
    color: '#D1D5DB',
  },
  tabBadgeTextActive: {
    color: '#1E40AF',
  },
  tabBadgeTextActiveDark: {
    color: '#60A5FA',
  },

  // Tab Content Section
  tabContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContentDark: {
    backgroundColor: '#1F2937',
  },

  // Products Tab
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editProfileButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refreshButtonDark: {
    backgroundColor: '#374151',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  refreshButtonTextDark: {
    color: '#D1D5DB',
  },

  // Product Card
  productCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  productCategoryDark: {
    color: '#9CA3AF',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  viewButton: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  viewButtonDark: {
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
  },
  editButton: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  editButtonDark: {
    backgroundColor: '#78350F',
    borderColor: '#F59E0B',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  deleteButtonDark: {
    backgroundColor: '#7F1D1D',
    borderColor: '#EF4444',
  },
  boostButton: {
    backgroundColor: '#DCFCE7',
    borderColor: '#10B981',
  },
  boostButtonDark: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewButtonText: {
    color: '#1E40AF',
  },
  viewButtonTextDark: {
    color: '#60A5FA',
  },
  editButtonText: {
    color: '#D97706',
  },
  editButtonTextDark: {
    color: '#FBBF24',
  },
  deleteButtonText: {
    color: '#DC2626',
  },
  deleteButtonTextDark: {
    color: '#F87171',
  },
  boostButtonText: {
    color: '#059669',
  },
  boostButtonTextDark: {
    color: '#34D399',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateTitleDark: {
    color: '#FFFFFF',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  emptyStateDescriptionDark: {
    color: '#9CA3AF',
  },
  emptyStateButton: {
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Tab header
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#EA580C',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Products grid
  productsGrid: {
    gap: 12,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productCardDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  productImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
  },
  pendingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(251, 146, 60, 0.9)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pendingBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Forfait badges (booster badges)
  forfaitBadgesContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 6,
    maxWidth: '80%',
  },
  forfaitBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  forfaitBadgePremium: {
    backgroundColor: 'rgba(147, 51, 234, 0.95)', // Purple
  },
  forfaitBadgeTopAnnonce: {
    backgroundColor: 'rgba(59, 130, 246, 0.95)', // Blue
  },
  forfaitBadgeUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)', // Red
  },
  forfaitBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  forfaitDaysText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.9,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productNameDark: {
    color: '#FFFFFF',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EA580C',
    marginBottom: 12,
  },
  productPriceDark: {
    color: '#FB923C',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  productActionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Profile Tab
  profileForm: {
    gap: 8,
  },
  profileField: {
    marginBottom: 8,
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  profileLabelDark: {
    color: '#D1D5DB',
  },
  profileInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  profileInputDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    color: '#FFFFFF',
  },
  profileInputDisabled: {
    backgroundColor: '#E5E7EB',
    color: '#6B7280',
  },
  profileInputDisabledDark: {
    backgroundColor: '#1F2937',
    color: '#6B7280',
  },
  profileValue: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  profileValueDark: {
    backgroundColor: '#374151',
  },
  profileValueText: {
    fontSize: 14,
    color: '#111827',
  },
  profileValueTextDark: {
    color: '#FFFFFF',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  editButton2: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Settings Section (in profile tab)
  settingsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  settingsSectionDark: {
    borderTopColor: '#374151',
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  settingsTitleDark: {
    color: '#FFFFFF',
  },
  settingsButtons: {
    gap: 12,
  },
  dashboardButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  settingsButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
