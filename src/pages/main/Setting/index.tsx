import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import Constants from 'expo-constants';
import { useTheme, useThemeMode } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTranslation } from '../../../hooks/useTranslation';
import pushNotificationService from '../../../services/pushNotificationService';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Settings = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { theme } = useTheme();
  const { mode, setMode } = useThemeMode();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const colors = theme.colors;

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const loadNotificationPreference = async () => {
      const enabled = await pushNotificationService.getNotificationPreference();
      setNotificationsEnabled(enabled);
    };
    loadNotificationPreference();
  }, []);

  const isDarkMode = mode === 'dark' || (mode === 'system' && theme.isDark);

  const toggleTheme = () => {
    setMode(isDarkMode ? 'light' : 'dark');
  };

  const toggleLanguage = async () => {
    await setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await pushNotificationService.setNotificationEnabled(newValue);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      gap: 32,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textTertiary,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    section: {
      gap: 12,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 8,
      borderColor: colors.border,
      borderWidth: 1,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    settingTextContainer: {
      flex: 1,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    navigationItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 8,
      borderColor: colors.border,
      borderWidth: 1,
    },
    chevron: {
      marginLeft: 'auto',
    },
    versionContainer: {
      marginTop: 24,
      paddingVertical: 20,
      alignItems: 'center',
      gap: 4,
    },
    versionText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    versionSubtext: {
      fontSize: 12,
      color: colors.textTertiary,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* THEME SWITCH */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.appearance')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Icon
                  name={isDarkMode ? "moon" : "sunny"}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t('settings.darkMode.title')}</Text>
                <Text style={styles.settingDescription}>
                  {isDarkMode ? t('settings.darkMode.enabled') : t('settings.darkMode.disabled')}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* LANGUAGE SWITCH */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.language')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Icon
                  name="language-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t('settings.languageOption.title')}</Text>
                <Text style={styles.settingDescription}>
                  {language === 'fr' ? t('settings.languageOption.french') : t('settings.languageOption.english')}
                </Text>
              </View>
            </View>
            <Switch
              value={language === 'en'}
              onValueChange={toggleLanguage}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* NOTIFICATIONS SWITCH */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.notifications')}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Icon
                  name={notificationsEnabled ? "notifications" : "notifications-off"}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t('settings.notificationsOption.title')}</Text>
                <Text style={styles.settingDescription}>
                  {notificationsEnabled ? t('settings.notificationsOption.enabled') : t('settings.notificationsOption.disabled')}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* INFORMATION & LEGAL SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sections.infoLegal')}</Text>
          
          <TouchableOpacity
            style={styles.navigationItem}
            onPress={() => navigation.navigate('About')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Icon
                  name="information-circle"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t('settings.about.title')}</Text>
                <Text style={styles.settingDescription}>
                  {t('settings.about.description')}
                </Text>
              </View>
            </View>
            <Icon
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
              style={styles.chevron}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navigationItem}
            onPress={() => navigation.navigate('Contact')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Icon
                  name="mail"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t('settings.contact.title')}</Text>
                <Text style={styles.settingDescription}>
                  {t('settings.contact.description')}
                </Text>
              </View>
            </View>
            <Icon
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
              style={styles.chevron}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navigationItem}
            onPress={() => navigation.navigate('UseCondition')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Icon
                  name="document-text"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t('settings.terms.title')}</Text>
                <Text style={styles.settingDescription}>
                  {t('settings.terms.description')}
                </Text>
              </View>
            </View>
            <Icon
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
              style={styles.chevron}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navigationItem}
            onPress={() => navigation.navigate('Confidentiality')}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Icon
                  name="shield-checkmark"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{t('settings.privacy.title')}</Text>
                <Text style={styles.settingDescription}>
                  {t('settings.privacy.description')}
                </Text>
              </View>
            </View>
            <Icon
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
              style={styles.chevron}
            />
          </TouchableOpacity>
        </View>

        {/* VERSION INFO */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            {t('settings.version')} {Constants.expoConfig?.version || '1.0.0'}
          </Text>
          <Text style={styles.versionSubtext}>
            {t('settings.copyright')} {new Date().getFullYear()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Settings;