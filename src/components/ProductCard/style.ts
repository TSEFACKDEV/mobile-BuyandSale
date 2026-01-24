import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    width: '48.5%', // 2 produits par ligne avec gap
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  forfaitBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  forfaitText: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: '700',
  },
  priceBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EA580C',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
    maxWidth: '70%',
  },
  priceText: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: '700',
    flexShrink: 1,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  content: {
    padding: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    fontSize: 11,
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 18,
    minHeight: 36,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: '65%',
  },
  categoryText: {
    fontSize: 11,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    fontSize: 11,
  },
});

export default styles;
