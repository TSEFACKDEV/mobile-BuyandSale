import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, AuthStackParamList, HomeStackParamList } from '../types/navigation';

// Hook pour naviguer dans la stack Auth
export const useAuthNavigation = () => {
  return useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
};

// Hook pour naviguer dans la stack Home
export const useHomeNavigation = () => {
  return useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
};

// Hook pour naviguer dans la stack Root
export const useRootNavigation = () => {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
};

// Hook générique pour tous les types de navigation
export const useAppNavigation = useNavigation;
