import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  // Hero Section
  heroSection: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  lastUpdatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#FFF',
  },
  // Summary Card
  summaryCard: {
    marginHorizontal: 16,
    marginTop: -20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Section
  section: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  // Data Card
  dataCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  dataCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  dataCardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B35',
    marginTop: 7,
    marginRight: 12,
  },
  dataItemText: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  // Usage List
  usageList: {
    gap: 12,
  },
  usageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  usageText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  // Sharing Card
  sharingCard: {
    gap: 16,
  },
  sharingGood: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  sharingGoodTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 12,
    marginBottom: 8,
  },
  sharingGoodText: {
    fontSize: 13,
    color: '#059669',
    lineHeight: 20,
  },
  sharingBad: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  sharingBadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 12,
    marginBottom: 8,
  },
  sharingBadText: {
    fontSize: 13,
    color: '#DC2626',
    lineHeight: 20,
  },
  // Rights List
  rightsList: {
    gap: 16,
  },
  rightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rightIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  rightDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  // Contact Section
  contactSection: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  contactDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  contactButton: {
    backgroundColor: '#FFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF6B35',
  },
});

export default styles;
