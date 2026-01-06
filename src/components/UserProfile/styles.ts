import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    padding: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  paymentsList: {
    padding: 16,
    paddingTop: 8,
    gap: 16,
  },
  paymentCard: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  productInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 10,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 3,
  },
  forfaitBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  forfaitBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#d1fae520',
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },
  dateText: {
    fontSize: 11,
  },
  statusContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  amountText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardDetails: {
    borderTopWidth: 1,
    padding: 12,
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
  },
  progressContainer: {
    marginTop: 0,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressDays: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBar: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  progressText: {
    fontSize: 11,
    textAlign: 'right',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  paginationButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
