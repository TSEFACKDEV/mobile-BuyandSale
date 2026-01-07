import { StyleSheet } from 'react-native'
import COLORS from '../../colors'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
    justifyContent: 'center',
  },

  /* ===== HEADER SECTION ===== */
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '400',
  },

  /* ===== FORM SECTION ===== */
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  /* ===== INFO BOX ===== */
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    gap: 10,
  },
  infoBoxText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },

  /* ===== TERMS SECTION ===== */
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '600',
    flex: 1,
  },

  /* ===== BUTTON SECTION ===== */
  registerButton: {
    marginBottom: 12,
    marginTop: 4,
  },

  /* ===== GOOGLE AUTH SECTION ===== */
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DADCE0',
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3C4043',
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: '#F5F5F5',
  },

  /* ===== LOGIN SECTION ===== */
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '800',
    marginLeft: 4,
    textDecorationLine: 'underline',
  },

  /* ===== DIVIDER ===== */
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },

  /* ===== FOOTER SECTION ===== */
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  footerText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
})

export default styles