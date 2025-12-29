import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Header avec cover photo moderne
  headerSection: {
    position: 'relative',
    marginBottom: 12,
  },
  coverPhoto: {
    width: '100%',
    height: 140,
    backgroundColor: '#FF6B35',
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: -50,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  profileInfo: {
    flex: 1,
    paddingTop: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 6,
    opacity: 0.7,
  },
  memberSince: {
    fontSize: 11,
    opacity: 0.6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Stats row moderne
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FF6B35',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.6,
  },

  // Action buttons modernes
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  dashboardButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  primaryButtonText: {
    color: '#FFF',
  },

  // Tabs modernes avec icônes
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  tabContent: {
    alignItems: 'center',
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#FF6B35',
    fontWeight: '700',
  },
  tabBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B35',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Content
  contentContainer: {
    flex: 1,
    padding: 16,
  },

  // Products grid moderne
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  productCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F3F4F6',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FF6B35',
    marginBottom: 10,
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  productActionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 0,
  },
  editButton: {
    backgroundColor: '#FFF3E0',
    borderWidth: 0,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    borderWidth: 0,
  },
  boostButton: {
    backgroundColor: '#FFF8E1',
    borderWidth: 0,
  },
  productActionText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Profile Edit Form moderne
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
    borderColor: '#E0E0E0',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },

  // Settings modernes
  settingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 16,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  settingIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  settingSubtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  
  // Toggle Switch moderne
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleButton: {
    width: 52,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  toggleThumbInactive: {
    alignSelf: 'flex-start',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
});
