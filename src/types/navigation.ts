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

// Main (Home) Stack
export type HomeStackParamList = {
  Home: undefined;
  Products: undefined;
  ProductDetails: { productId: string };
  Sellers: undefined;
  SellerDetails: { sellerId: string };
  UserProfile: undefined;
};

// Bottom Tab Navigator
export type BottomTabParamList = {
  HomeTab: undefined;
  Products: undefined;
  Sellers: undefined;
  Profile: undefined;
};

// Root Stack (contrôle le flux : Onboarding -> Auth -> Main)
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

// Drawer (optionnel pour menu latéral dans Main)
export type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

// Déclaration globale pour useNavigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}