import { StyleSheet } from 'react-native';

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      width: 80,
      alignItems: 'center',
      marginRight: 12,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconText: {
      fontSize: 32,
    },
    name: {
      fontSize: 12,
      color: colors.text,
      textAlign: 'center',
      fontWeight: '500',
    },
  });

export default createStyles;
