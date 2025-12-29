import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  mainRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  averageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewsCountText: {
    fontSize: 12,
  },
  newSellerText: {
    fontSize: 12,
    marginLeft: 8,
  },
  detailsContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  detailsHeaderText: {
    fontSize: 12,
  },
  distributionContainer: {
    gap: 6,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    width: 24,
  },
  starNumber: {
    fontSize: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FACC15',
    borderRadius: 3,
  },
  countText: {
    fontSize: 12,
    width: 24,
    textAlign: 'right',
  },
});

export default styles;
