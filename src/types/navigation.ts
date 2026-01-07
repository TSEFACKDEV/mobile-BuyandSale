// types/navigation.ts
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  UserProfile: undefined;
  Favorites: undefined;
};

// Products Stack (écrans de produits)
export type ProductsStackParamList = {
  ProductsList: { categoryId?: string };
};

// Bottom Tab Navigator (navigation principale optimisée)
export type BottomTabParamList = {
  HomeTab: undefined;
  Products: undefined; // Le tab lui-même ne reçoit pas de params
  PostAd: undefined;
  Sellers: undefined;
  Profile: undefined;
};

// Main Stack Navigator (BottomTab + Modals)
export type MainStackParamList = {
  MainTab: undefined;
  Notifications: undefined;
};

// Root Stack (contrôle le flux : Onboarding -> Auth -> Main)
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

// Navigation Props
export type RootNavigationProp = NativeStackNavigationProp<MainStackParamList & BottomTabParamList>;

// Déclaration globale pour useNavigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}