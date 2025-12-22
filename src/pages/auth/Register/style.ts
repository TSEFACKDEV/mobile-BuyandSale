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

  /* ===== TERMS SECTION ===== */
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '500',
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  /* ===== BUTTON SECTION ===== */
  registerButton: {
    marginBottom: 12,
    marginTop: 4,
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