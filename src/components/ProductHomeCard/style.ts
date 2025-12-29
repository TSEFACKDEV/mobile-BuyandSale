import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 120;

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.6,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  containerWithBorder: {
    borderWidth: 2,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.9,
    backgroundColor: colors.border,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.border,
  },
  forfaitBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  forfaitText: {
    fontSize: 7,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  contentContainer: {
    padding: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    height: 32,
    lineHeight: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 4,
    height: 14,
  },
  location: {
    fontSize: 10,
    color: colors.textSecondary,
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewsText: {
    fontSize: 9,
    color: colors.textSecondary,
  },
});

export default createStyles;