import { StyleSheet } from 'react-native';

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  titleSection: {
    flex: 1,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  orangeText: {
    color: '#FB923C', // COLORS.primary
  },
  darkBlueText: {
    color: '#1E40AF', // COLORS.secondary
  },
});

export default createStyles;
