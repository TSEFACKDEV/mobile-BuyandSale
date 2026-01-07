import { StyleSheet } from 'react-native';

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    width: 120,
    height: 170,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 1.5,
    backgroundColor: '#FB923C',
    alignSelf: 'center',
    marginBottom: 6,
  },
  avatarContainer: {
    width: 37,
    height: 37,
    borderRadius: 18.5,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    width: 37,
    height: 37,
    borderRadius: 18.5,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
    textAlign: 'center',
    minHeight: 32,
  },
  statsContainer: {
    gap: 3,
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 1,
  },
  ratingValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  reviewCount: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: '#EA580C',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default createStyles;