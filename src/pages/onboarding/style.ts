import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get('window');

const COLORS = {
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
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // Slide styles
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    width,
  },

  slideContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },

  // Icon Circle with gradient effect
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    elevation: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },

  image: {
    width: width * 0.75,
    height: height * 0.28,
    marginBottom: 40,
    resizeMode: 'contain',
  },

  textContainer: {
    width: '100%',
    paddingHorizontal: 12,
    alignItems: 'center',
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 40,
  },

  description: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '400',
    marginBottom: 24,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: COLORS.white,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  // Indicators
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },

  indicator: {
    height: 8,
    width: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginHorizontal: 8,
  },

  activeIndicator: {
    backgroundColor: COLORS.primary,
    width: 28,
  },

  // Button Container
  buttonContainer: {
    width: '100%',
  },

  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  skipButtonCustom: {
    flex: 0.4,
  },

  nextButtonCustom: {
    flex: 0.6,
  },

  // Back Button
  backButton: {
    position: 'absolute',
    top: 54,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },

  // Progress badge
  progressBadge: {
    position: 'absolute',
    top: 54,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 10,
  },

  progressText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default styles;
export { COLORS };
