import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Linking, Image, Text, Platform } from 'react-native';
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
import About from '../pages/main/About/index';
import UseCondition from '../pages/main/UseCondition/index';
import Confidentiality from '../pages/main/Confidentiality/index';
import Contact from '../pages/main/Contact/index';
import PostAds from '../pages/main/PostAds/index';

// Guards
import Authenticated from '../Guards/Authenticated';

// Components
import TopNavigation from '../components/TopNavigation';

// Types
import {
  RootStackParamList,
  AuthStackParamList,
  HomeStackParamList,
  ProductsStackParamList,
  BottomTabParamList,
} from '../types/navigation';

// Context
import { useAuth } from '../contexts/AuthContext';
import { useThemeColors } from '../contexts/ThemeContext';
import { useAppSelector } from '../hooks/store';
import { getImageUrl } from '../utils/imageUtils';

// Créer les navigateurs
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();
const SellersStack = createNativeStackNavigator();
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
      {/* Pages légales accessibles depuis l'inscription */}
      <AuthStack.Group
        screenOptions={{
          presentation: 'modal',
          headerShown: false,
        }}
      >
        <AuthStack.Screen
          name="UseCondition"
          component={UseConditionWithNav}
        />
        <AuthStack.Screen
          name="Confidentiality"
          component={ConfidentialityWithNav}
        />
      </AuthStack.Group>
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
        options={{
          title: 'Détails du produit',
        }}
      >
        {() => (
          <Authenticated>
            <ProductDetails />
          </Authenticated>
        )}
      </HomeStack.Screen>
      <HomeStack.Screen
        name="SellerDetails"
        options={{
          title: 'Profil du vendeur',
        }}
      >
        {() => (
          <Authenticated>
            <SellerDetails />
          </Authenticated>
        )}
      </HomeStack.Screen>
      <HomeStack.Screen
        name="UserProfile"
        options={{
          title: 'Mon profil',
        }}
      >
        {() => (
          <Authenticated>
            <TopNavigation showBackButton title="Mon profil" />
            <UserProfile />
          </Authenticated>
        )}
      </HomeStack.Screen>
      <HomeStack.Screen
        name="Favorites"
        options={{
          title: 'Favoris',
        }}
      >
        {() => (
          <Authenticated>
            <TopNavigation showBackButton title="Favoris" />
            <Favorites />
          </Authenticated>
        )}
      </HomeStack.Screen>
    </HomeStack.Navigator>
  );
};

// =====================
// =====================
// Products Stack Navigator
// =====================
const ProductsStackNavigator = () => {
  return (
    <ProductsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProductsStack.Screen 
        name="ProductsList" 
        component={Products}
      />
    </ProductsStack.Navigator>
  );
};

// =====================
// Sellers Stack Navigator
// =====================
const SellersStackNavigator = () => {
  return (
    <SellersStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <SellersStack.Screen name="SellersList" component={Sellers} />
      <SellersStack.Screen
        name="SellerDetails"
        options={{
          title: 'Profil du vendeur',
        }}
      >
        {() => (
          <Authenticated>
            <SellerDetails />
          </Authenticated>
        )}
      </SellersStack.Screen>
    </SellersStack.Navigator>
  );
};

// =====================
// Wrapper components for screens with TopNavigation
// =====================

const NotificationsWithNav = () => (
  <View style={{ flex: 1 }}>
    <Authenticated>
      <TopNavigation showBackButton title="Notifications" />
      <Notifications />
    </Authenticated>
  </View>
);

const SettingsWithNav = () => (
  <View style={{ flex: 1 }}>
    <Authenticated>
      <TopNavigation showBackButton title="Paramètres" />
      <Settings />
    </Authenticated>
  </View>
);

const AboutWithNav = () => (
  <View style={{ flex: 1 }}>
    <TopNavigation showBackButton title="À propos" />
    <About />
  </View>
);

const UseConditionWithNav = () => (
  <View style={{ flex: 1 }}>
    <TopNavigation showBackButton title="Conditions d'utilisation" />
    <UseCondition />
  </View>
);

const ConfidentialityWithNav = () => (
  <View style={{ flex: 1 }}>
    <TopNavigation showBackButton title="Politique de confidentialité" />
    <Confidentiality />
  </View>
);

const ContactWithNav = () => (
  <View style={{ flex: 1 }}>
    <TopNavigation showBackButton title="Contact" />
    <Contact />
  </View>
);

const PostAdsWithNav = () => (
  <View style={{ flex: 1 }}>
    <Authenticated>
      <PostAds />
    </Authenticated>
  </View>
);

// =====================
// Bottom Tab Navigator (optimisé)
// =====================
const MainTabNavigator = () => {
  const colors = useThemeColors();
  const authState = useAppSelector((state) => state.authentification);
  const user = authState.auth.entities;

  return (
    <BottomTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: string = 'home';
          let iconSize = 24;

          // Bouton Profile avec avatar
          if (route.name === 'Profile') {
            if (user && user.avatar && user.avatar !== 'undefined' && user.avatar !== 'null') {
              return (
                <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                  <Image
                    source={{ uri: getImageUrl(user.avatar, 'avatar') }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: focused ? '#FF6B35' : colors.textTertiary,
                    }}
                  />
                </View>
              );
            } else if (user) {
              return (
                <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: focused ? '#FF6B35' : colors.textTertiary,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: focused ? '#FF6B35' : colors.textTertiary,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                      {`${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`}
                    </Text>
                  </View>
                </View>
              );
            }
            iconName = focused ? 'person' : 'person-outline';
            return <Icon name={iconName} size={iconSize} color={color} />;
          }

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
            default:
              break;
          }

          return <Icon name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.2)',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -10,
          },
          shadowOpacity: 0.25,
          shadowRadius: 25,
          elevation: 20,
        },
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
        component={ProductsStackNavigator}
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
        component={SellersStackNavigator}
        options={{
          tabBarLabel: 'Vendeurs',
          title: 'Vendeurs',
        }}
      />

      {/* PROFILE - Visible uniquement si connecté */}
      {user && (
        <BottomTab.Screen
          name="Profile"
          component={HomeStackNavigator}
          options={{
            tabBarLabel: '',
            title: 'Profil',
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('HomeTab', {
                screen: 'UserProfile',
              } as never);
            },
          })}
        />
      )}
    </BottomTab.Navigator>
  );
};

// =====================
// Main Stack Navigator (BottomTab + Modals)
// =====================
const MainStackNavigator = () => (
  <MainStack.Navigator
    id="MainStack"
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
        name="Notifications"
        component={NotificationsWithNav}
      />
      <MainStack.Screen
        name="Settings"
        component={SettingsWithNav}
      />
      <MainStack.Screen
        name="About"
        component={AboutWithNav}
      />
      <MainStack.Screen
        name="UseCondition"
        component={UseConditionWithNav}
      />
      <MainStack.Screen
        name="Confidentiality"
        component={ConfidentialityWithNav}
      />
      <MainStack.Screen
        name="Contact"
        component={ContactWithNav}
      />
    </MainStack.Group>
  </MainStack.Navigator>
);

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
          // Onboarding uniquement au premier lancement
          <RootStack.Screen name="Onboarding" component={Onboarding} />
        ) : (
          // Après onboarding, toujours accès à Main (comme le web)
          // L'authentification sera vérifiée page par page avec le Guard
          <>
            <RootStack.Screen name="Main" component={MainStackNavigator} />
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
