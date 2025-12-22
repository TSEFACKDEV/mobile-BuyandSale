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

// Types
import { RootStackParamList, AuthStackParamList, HomeStackParamList, BottomTabParamList } from '../types/navigation';

// Context
import { useAuth } from '../contexts/AuthContext';

// Créer les navigateurs
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const BottomTab = createBottomTabNavigator<BottomTabParamList>();

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
        headerShown: true,
        headerTintColor: '#FF6B35',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <HomeStack.Screen 
        name="Home" 
        component={Home}
        options={{
          headerShown: false,
        }}
      />
      <HomeStack.Screen 
        name="Products" 
        component={Products}
        options={{
          title: 'Produits',
        }}
      />
      <HomeStack.Screen 
        name="ProductDetails" 
        component={ProductDetails}
        options={{
          title: 'Détails du produit',
        }}
      />
      <HomeStack.Screen 
        name="Sellers" 
        component={Sellers}
        options={{
          title: 'Vendeurs',
        }}
      />
      <HomeStack.Screen 
        name="SellerDetails" 
        component={SellerDetails}
        options={{
          title: 'Profil du vendeur',
        }}
      />
      <HomeStack.Screen 
        name="UserProfile" 
        component={UserProfile}
        options={{
          title: 'Mon profil',
        }}
      />
    </HomeStack.Navigator>
  );
};

// =====================
// Bottom Tab Navigator (pour la partie Main)
// =====================
const MainTabNavigator = () => {
  return (
    <BottomTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'home';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Sellers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#95969D',
        headerShown: false,
        tabBarLabel: route.name === 'HomeTab' ? 'Accueil' : route.name,
      })}
    >
      <BottomTab.Screen 
        name="HomeTab" 
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Accueil',
          title: 'Accueil',
        }}
      />
      <BottomTab.Screen 
        name="Products" 
        component={Products}
        options={{
          tabBarLabel: 'Produits',
          title: 'Produits',
        }}
      />
      <BottomTab.Screen 
        name="Sellers" 
        component={Sellers}
        options={{
          tabBarLabel: 'Vendeurs',
          title: 'Vendeurs',
        }}
      />
      <BottomTab.Screen 
        name="Profile" 
        component={UserProfile}
        options={{
          tabBarLabel: 'Profil',
          title: 'Mon profil',
        }}
      />
    </BottomTab.Navigator>
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
          <RootStack.Screen 
            name="Onboarding" 
            component={Onboarding}
          />
        ) : !isUserLoggedIn ? (
          <RootStack.Screen 
            name="Auth" 
            component={AuthNavigator}
          />
        ) : (
          <RootStack.Screen 
            name="Main" 
            component={MainTabNavigator}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
