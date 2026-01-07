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
  // Notice Card
  noticeCard: {
    marginHorizontal: 16,
    marginTop: -20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Section
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  // Services Grid
  servicesGrid: {
    marginTop: 12,
    gap: 12,
  },
  // Info Card
  infoCard: {
    borderRadius: 10,
    padding: 16,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  infoCardItem: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  // Warning Card
  warningCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    gap: 8,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F59E0B',
  },
  warningText: {
    fontSize: 13,
    color: '#F59E0B',
    lineHeight: 20,
  },
  // Sanctions Card
  sanctionsCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 10,
    padding: 20,
    marginTop: 12,
    alignItems: 'center',
  },
  sanctionsProgression: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  sanctionsDescription: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
  },
  // Modifications Section
  modificationsSection: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  modificationsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  modificationsDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modificationsInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    padding: 16,
    width: '100%',
  },
  modificationsInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  modificationsInfoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
});

export default styles;