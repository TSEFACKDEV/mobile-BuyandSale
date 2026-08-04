import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import Constants from 'expo-constants';
import { useTheme, useThemeMode } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDialog } from '../../../contexts/DialogContext';
import pushNotificationService from '../../../services/pushNotificationService';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { deleteMyAccountAction } from '../../../store/authentification/actions';

const Settings = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const { mode, setMode } = useThemeMode();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const { showDestructive, showWarning } = useDialog();
  const colors = theme.colors;

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showDeletePasswordPrompt, setShowDeletePasswordPrompt] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const user = useAppSelector((state) => state.authentification.auth.entities);
  const isProtectedUser = user?.roles?.some(
    (r: any) => r.role?.name === 'SUPER_ADMIN' || r.role?.name === 'ADMIN'
  ) ?? false;

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

  const handleDeleteAccount = useCallback(async () => {
    const confirmed = await showDestructive(
      'Supprimer mon compte',
      'Êtes-vous absolument sûr ? Cette action est irréversible. Toutes vos annonces, avis et données seront définitivement supprimés.',
      () => {
        setDeletePassword('');
        setShowDeletePasswordPrompt(true);
      }
    );
  }, [showDestructive]);

  const handleDeletePasswordSubmit = useCallback(async () => {
    if (!deletePassword) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe');
      return;
    }
    setIsDeleting(true);
    try {
      await dispatch(deleteMyAccountAction({ password: deletePassword })).unwrap();
      setShowDeletePasswordPrompt(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' as any, params: { screen: 'Login' } }],
      });
    } catch (error: any) {
      showWarning(
        'Erreur',
        error?.message || 'Une erreur est survenue lors de la suppression'
      );
    } finally {
      setIsDeleting(false);
    }
  }, [deletePassword, dispatch, navigation, showWarning]);

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

        {/* ACCOUNT SECTION — caché pour les admins */}
        {!isProtectedUser && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compte</Text>

            <TouchableOpacity
              style={[styles.settingItem, { borderColor: '#EF4444' }]}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Icon
                    name="trash-outline"
                    size={20}
                    color="#EF4444"
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: '#EF4444' }]}>
                    Supprimer mon compte
                  </Text>
                  <Text style={styles.settingDescription}>
                    Supprimer définitivement votre compte et toutes vos données
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
        )}

        {/* Password prompt modal for deletion */}
        <Modal
          visible={showDeletePasswordPrompt}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeletePasswordPrompt(false)}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: 24
          }}>
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 400,
            }}>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                  <Icon name="trash-outline" size={24} color="#EF4444" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                  Confirmez votre mot de passe
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 16 }}>
                  Veuillez entrer votre mot de passe pour confirmer la suppression définitive du compte.
                </Text>
              </View>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.background,
                  marginBottom: 16,
                }}
                placeholder="Votre mot de passe"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry
                value={deletePassword}
                onChangeText={setDeletePassword}
                autoFocus
              />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: 'center',
                  }}
                  onPress={() => setShowDeletePasswordPrompt(false)}
                >
                  <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 12,
                    backgroundColor: '#EF4444',
                    alignItems: 'center',
                    opacity: isDeleting ? 0.7 : 1,
                  }}
                  onPress={handleDeletePasswordSubmit}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFFFFF' }}>Confirmer</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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