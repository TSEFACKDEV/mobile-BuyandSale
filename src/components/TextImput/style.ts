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
  // Main Container
  container: {
    marginVertical: 12,
    width: '100%',
  },

  disabledContainer: {
    opacity: 0.6,
  },

  // Label
  labelContainer: {
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },

  required: {
    color: COLORS.error,
    fontWeight: 'bold',
  },

  // Input Container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
    height: 50,
  },

  inputContainerFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: '#FFF8F0',
  },

  inputContainerError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },

  inputContainerDisabled: {
    backgroundColor: COLORS.light,
    borderColor: COLORS.border,
  },

  // Input Text
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontWeight: '500',
  },

  // Icons
  leftIcon: {
    marginRight: 10,
  },

  rightIcon: {
    marginLeft: 10,
    padding: 8,
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },

  errorIcon: {
    marginRight: 6,
  },

  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '500',
  },

  // Character Count (OTP)
  charCountContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    paddingHorizontal: 4,
  },

  charCountText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
});

export default styles;