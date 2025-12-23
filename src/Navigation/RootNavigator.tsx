import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Pages
import Onboarding from '../pages/onboarding';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassWord';
import ResetPassword from '../pages/auth/ResetPassWord';
import VerifyOTP from '../pages/auth/VerifyOTP';
import AccountSuspended from '../pages/auth/AccountSuspended';
import SocialCallback from '../pages/auth/SocialCallback';
import Home from '../pages/main/Home';
import ProductDetails from '../pages/main/ProductDetails';
import Products from '../pages/main/Products';
import SellerDetails from '../pages/main/SellerDetails';
import Sellers from '../pages/main/Sellers';
import UserProfile from '../pages/main/UserProfile';
import Favorites from '../pages/main/Favorites/index';
import Notifications from '../pages/main/Notifications';
import Settings from '../pages/main/Setting/index';
import PostAds from '../pages/main/PostAds/index';

// Components
import TopNavigation from '../components/TopNavigation/TopNavigation';

// Types
import {
  RootStackParamList,
  AuthStackParamList,
  HomeStackParamList,
  BottomTabParamList,
} from '../types/navigation';

// Context
import { useAuth } from '../contexts/AuthContext';
import { useThemeColors } from '../contexts/ThemeContext';

// Créer les navigateurs
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const BottomTab = createBottomTabNavigator<BottomTabParamList>();
const MainStack = createNativeStackNavigator();

// =====================
// Auth Navigator
// =====================
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen 
        name="Register" 
        component={Register}
      />
      <AuthStack.Screen 
        name="ForgotPassword" 
        component={ForgotPassword}
      />
      <AuthStack.Screen 
        name="ResetPassword" 
        component={ResetPassword}
      />
      <AuthStack.Screen 
        name="VerifyOTP" 
        component={VerifyOTP}
      />
      <AuthStack.Screen 
        name="AccountSuspended" 
        component={AccountSuspended}
      />
      <AuthStack.Screen 
        name="SocialCallback" 
        component={SocialCallback}
      />
    </AuthStack.Navigator>
  );
};

// =====================
// Home Stack Navigator
// =====================
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="Home" component={Home} />
      <HomeStack.Screen
        name="ProductDetails"
        component={ProductDetails}
        options={{
          title: 'Détails du produit',
        }}
      />
      <HomeStack.Screen
        name="SellerDetails"
        component={SellerDetails}
        options={{
          title: 'Profil du vendeur',
        }}
      />
    </HomeStack.Navigator>
  );
};

// =====================
// Wrapper components for screens with TopNavigation
// =====================
const ProductsWithNav = () => (
  <View style={{ flex: 1 }}>
    <TopNavigation showBackButton title="Produits" />
    <Products />
  </View>
);

const SellersWithNav = () => (
  <View style={{ flex: 1 }}>
    <TopNavigation showBackButton title="Vendeurs" />
    <Sellers />
  </View>
);

const FavoritesWithNav = () => (
  <View style={{ flex: 1 }}>
    <TopNavigation showBackButton title="Favoris" />
    <Favorites />
  </View>
);

const NotificationsWithNav = () => (
  <View style={{ flex: 1 }}>
    <TopNavigation showBackButton title="Notifications" />
    <Notifications />
  </View>
);

const UserProfileWithNav = () => (
  <View style={{ flex: 1 }}>
    <TopNavigation showBackButton title="Mon profil" />
    <UserProfile />
  </View>
);

const SettingsWithNav = () => (
  <View style={{ flex: 1 }}>
    <Settings />
  </View>
);

const PostAdsWithNav = () => (
  <View style={{ flex: 1 }}>
    <PostAds />
  </View>
);

// =====================
// Bottom Tab Navigator (optimisé)
// =====================
const MainTabNavigator = () => {
  const colors = useThemeColors();

  return (
    <BottomTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: string = 'home';
          let iconSize = 24;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Products':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'PostAd':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              iconSize = 28;
              break;
            case 'Sellers':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              break;
          }

          return <Icon name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
        lazy: true,
      })}
    >
      {/* HOME */}
      <BottomTab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Accueil',
          title: 'Accueil',
        }}
      />

      {/* PRODUCTS */}
      <BottomTab.Screen
        name="Products"
        component={ProductsWithNav}
        options={{
          tabBarLabel: 'Produits',
          title: 'Produits',
        }}
      />

      {/* POST AD */}
      <BottomTab.Screen
        name="PostAd"
        component={PostAdsWithNav}
        options={{
          tabBarLabel: 'Publier',
          title: 'Publier',
        }}
      />

      {/* SELLERS */}
      <BottomTab.Screen
        name="Sellers"
        component={SellersWithNav}
        options={{
          tabBarLabel: 'Vendeurs',
          title: 'Vendeurs',
        }}
      />

      {/* SETTINGS */}
      <BottomTab.Screen
        name="Settings"
        component={SettingsWithNav}
        options={{
          tabBarLabel: 'Paramètres',
          title: 'Paramètres',
        }}
      />
    </BottomTab.Navigator>
  );
};

// =====================
// Main Stack Navigator (BottomTab + écrans TopNavigation)
// =====================
const MainStackNavigator = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainStack.Screen
        name="MainTab"
        component={MainTabNavigator}
      />
      <MainStack.Group
        screenOptions={{
          presentation: 'modal',
          headerShown: false,
        }}
      >
        <MainStack.Screen
          name="Favorites"
          component={FavoritesWithNav}
        />
        <MainStack.Screen
          name="Notifications"
          component={NotificationsWithNav}
        />
        <MainStack.Screen
          name="UserProfile"
          component={UserProfileWithNav}
        />
      </MainStack.Group>
    </MainStack.Navigator>
  );
};

// =====================
// Root Navigator (Onboarding -> Auth -> Main)
// =====================
export const RootNavigator = () => {
  const { isOnboardingComplete, isUserLoggedIn, isLoading } = useAuth();

  // Configuration du Deep Linking pour OAuth callback
  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [
      'buyandsale://',
      'http://localhost:19006',
      'exp://localhost:19000',
    ],
    config: {
      screens: {
        Auth: {
          screens: {
            SocialCallback: 'auth/social-callback',
          },
        },
        Main: 'main',
        Onboarding: 'onboarding',
      },
    },
    async getInitialURL() {
      // Vérifier si l'app a été ouverte via un deep link
      const url = await Linking.getInitialURL();
      
      if (url != null) {
        return url;
      }
      
      return undefined;
    },
    subscribe(listener) {
      // Écouter les deep links pendant que l'app est ouverte
      const onReceiveURL = ({ url }: { url: string }) => {
        listener(url);
      };

      const subscription = Linking.addEventListener('url', onReceiveURL);

      return () => {
        subscription.remove();
      };
    },
  };

  // Écran de chargement
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isOnboardingComplete ? (
          <RootStack.Screen name="Onboarding" component={Onboarding} />
        ) : !isUserLoggedIn ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <RootStack.Screen name="Main" component={MainStackNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
