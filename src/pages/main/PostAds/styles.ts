import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
export const IMAGE_SIZE = (width - 80) / 3;
export const MAX_IMAGES = 5;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header moderne avec design soft
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.65,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 32,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // Step Indicator compact et élégant
  stepIndicatorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  stepsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 320,
    alignSelf: 'center',
  },
  stepItem: {
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  stepCircleActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
    elevation: 3,
    shadowOpacity: 0.2,
  },
  stepCircleCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepCircleInactive: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  stepNumber: {
    fontSize: 15,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: '#FFF',
  },
  stepNumberInactive: {
    color: '#9CA3AF',
  },
  stepLine: {
    width: 35,
    height: 2,
    marginHorizontal: 3,
    borderRadius: 1,
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },
  stepLineInactive: {
    backgroundColor: '#E5E7EB',
  },
  stepLabel: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 60,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  
  // Card moderne pour le formulaire
  formCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  
  stepTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  // Input Groups avec design soft
  inputGroup: {
    marginBottom: 22,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    minHeight: 130,
    textAlignVertical: 'top',
    backgroundColor: '#FAFAFA',
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
    opacity: 0.7,
  },
  characterCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  validText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },

  // Grid moderne pour catégories/villes - Grille complète sur toute la largeur
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  gridButton: {
    flex: 1,
    minWidth: '31%',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  gridButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
    elevation: 3,
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gridButtonText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  gridButtonTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },

  // Conditions buttons modernes
  conditionContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  conditionButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  conditionButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
    elevation: 2,
  },
  conditionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  conditionButtonTextActive: {
    color: '#FFF',
  },

  // Image Upload zone moderne
  uploadZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  uploadZoneActive: {
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  uploadZoneDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    opacity: 0.5,
  },
  uploadIcon: {
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
  },
  uploadSubtitle: {
    fontSize: 13,
    marginBottom: 8,
  },
  uploadCount: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Image Preview Grid
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FFF',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  imageCounterText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // Summary Card (comme le web)
  // Summary Card élégante
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Checkbox moderne
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  checkboxLabel: {
    fontSize: 14,
    flex: 1,
  },

  // Footer Navigation moderne
  footer: {
    flexDirection: 'row',
    padding: 24,
    paddingBottom: 80, // Espace pour la bottom navigation
    borderTopWidth: 0,
    gap: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
    minHeight: 54,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backFooterButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    flex: 1,
  },
  nextFooterButton: {
    backgroundColor: '#FF6B35',
    flex: 1,
    elevation: 3,
    shadowOpacity: 0.2,
  },
  submitButton: {
    backgroundColor: '#10B981',
    flex: 1,
    elevation: 3,
    shadowOpacity: 0.2,
  },
  footerButtonDisabled: {
    opacity: 0.5,
    elevation: 0,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  footerButtonTextWhite: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },

  // Grid layout moderne pour price/category
  rowGrid: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 22,
  },
  rowGridItem: {
    flex: 1,
  },

  // Price input avec icône et design moderne
  priceInputContainer: {
    position: 'relative',
  },
  priceLabel: {
    position: 'absolute',
    right: 18,
    top: '50%',
    transform: [{ translateY: -8 }],
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Step titles dans card
  stepTitleContainer: {
    marginBottom: 24,
  },
  formStepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  formStepSubtitle: {
    fontSize: 13,
  },

  // Step indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  stepIndicatorItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  // Picker styles
  picker: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 15,
  },

  // Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  pickerHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  pickerItemText: {
    fontSize: 15,
  },
});
