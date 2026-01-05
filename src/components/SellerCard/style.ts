import { StyleSheet } from 'react-native';

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 220,
      justifyContent: 'space-between',
    },
    avatarWrapper: {
      marginBottom: 12,
    },
    avatarContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#10b981',
      justifyContent: 'center',
      alignItems: 'center',
    },
    verifiedText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    name: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 12,
      height: 44,
    },
    statsContainer: {
      width: '100%',
      marginBottom: 12,
      minHeight: 50,
    },
    stat: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    statText: {
      fontSize: 13,
      color: colors.textSecondary,
      marginLeft: 6,
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      marginRight: 4,
    },
    ratingValue: {
      fontSize: 12,
      fontWeight: '600',
      color: '#92400E',
      marginLeft: 3,
    },
    reviewCount: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      width: '100%',
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default createStyles;
