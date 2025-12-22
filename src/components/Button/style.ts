import { StyleSheet } from "react-native";

export const COLORS = {
  primary: '#FF8C00',
  secondary: '#001F3F',
  accent: '#FFA500',
  light: '#F5F5F5',
  white: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  border: '#E0E0E0',
  gradient1: '#FF8C00',
  gradient2: '#FFB347',
  error: '#FF4C4C',
  success: '#28A745',
};

const styles = StyleSheet.create({
  // Base Button
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  // Content Container
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Variants
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderWidth: 0,
  },

  secondaryButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 0,
  },

  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  dangerButton: {
    backgroundColor: COLORS.error,
    borderWidth: 0,
  },

  // Sizes
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },

  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
  },

  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },

  // Text Variants
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },

  primaryText: {
    color: COLORS.white,
    fontSize: 16,
  },

  secondaryText: {
    color: COLORS.white,
    fontSize: 16,
  },

  outlineText: {
    color: COLORS.primary,
    fontSize: 16,
  },

  dangerText: {
    color: COLORS.white,
    fontSize: 16,
  },

  // Text Sizes
  smallText: {
    fontSize: 13,
    fontWeight: '500',
  },

  mediumText: {
    fontSize: 16,
    fontWeight: '600',
  },

  largeText: {
    fontSize: 18,
    fontWeight: '600',
  },

  // States
  disabledButton: {
    opacity: 0.5,
  },

  disabledText: {
    opacity: 0.6,
  },

  pressed: {
    opacity: 0.8,
  },

  // Full Width
  fullWidthButton: {
    width: '100%',
  },

  // Icons
  leftIcon: {
    marginRight: 8,
  },

  rightIcon: {
    marginLeft: 8,
  },
});

export default styles;