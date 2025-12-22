// types/navigation.ts

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  VerifyOTP: { userId?: string };
  AccountSuspended: undefined;
  SocialCallback: { token?: string }
};

// Home Stack (contient les écrans de contenu)
export type HomeStackParamList = {
  Home: undefined;
  ProductDetails: { productId: string };
  SellerDetails: { sellerId: string };
};

// Bottom Tab Navigator (navigation principale optimisée)
export type BottomTabParamList = {
  HomeTab: undefined;
  Products: undefined;
  Sellers: undefined;
  Settings: undefined;
};

// Main Stack Navigator (BottomTab + écrans TopNavigation)
export type MainStackParamList = {
  MainTab: undefined;
  Favorites: undefined;
  Notifications: undefined;
  UserProfile: undefined;
};

// Root Stack (contrôle le flux : Onboarding -> Auth -> Main)
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

// Déclaration globale pour useNavigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}