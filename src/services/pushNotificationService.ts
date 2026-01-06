import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_ENABLED_KEY = '@notifications_enabled';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class PushNotificationService {
  private notificationsEnabled: boolean = true;

  async initialize(): Promise<void> {
    if (!Device.isDevice) {
      return;
    }

    const enabled = await this.getNotificationPreference();
    this.notificationsEnabled = enabled;

    if (enabled) {
      await this.requestPermissions();
    }
  }

  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6F00',
      });
    }

    return true;
  }

  async showNotification(title: string, body: string, data?: any): Promise<void> {
    if (!this.notificationsEnabled) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  }

  async setNotificationEnabled(enabled: boolean): Promise<void> {
    this.notificationsEnabled = enabled;
    await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, JSON.stringify(enabled));

    if (enabled) {
      await this.requestPermissions();
    }
  }

  async getNotificationPreference(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY);
      return value !== null ? JSON.parse(value) : true;
    } catch {
      return true;
    }
  }
}

export default new PushNotificationService();
