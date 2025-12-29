import { StyleSheet } from 'react-native';

const createStyles = (theme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginLeft: 8,
    },
    badge: {
      backgroundColor: '#FF6B35',
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    badgeText: {
      color: '#FFF',
      fontSize: 11,
      fontWeight: '700',
    },
    closeButton: {
      padding: 8,
    },
    scrollContent: {
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    radioContainer: {
      marginBottom: 12,
    },
    radioButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
    },
    radioCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.border,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioCircleSelected: {
      borderColor: '#FF6B35',
    },
    radioCircleInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#FF6B35',
    },
    radioLabel: {
      fontSize: 14,
      color: theme.text,
    },
    priceInputsContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    priceInputWrapper: {
      flex: 1,
    },
    inputLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: theme.text,
      backgroundColor: theme.surface,
    },
    footer: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    clearButton: {
      flex: 1,
      backgroundColor: theme.backgroundSecondary,
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
    },
    clearButtonText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
    applyButton: {
      flex: 1,
      backgroundColor: '#FF6B35',
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
    },
    applyButtonText: {
      color: '#FFF',
      fontSize: 14,
      fontWeight: '600',
    },
    categoriesScroll: {
      maxHeight: 200,
    },
  });

export default createStyles;
