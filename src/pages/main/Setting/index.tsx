import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme, useThemeMode } from '../../../contexts/ThemeContext';
import TopNavigation from '../../../components/TopNavigation/TopNavigation';

const Settings = () => {
  const { theme } = useTheme();
  const { mode, setMode } = useThemeMode();
  const colors = theme.colors;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      gap: 24,
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
      gap: 8,
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
    themeOptionContainer: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    themeOption: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      borderColor: colors.border,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeOptionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '15',
    },
    themeOptionText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    themeOptionIcon: {
      marginBottom: 4,
    },
  });

  return (
    <View style={styles.container}>
      <TopNavigation showBackButton title="Paramètres" />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* THEME SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apparence</Text>

          {/* Theme Mode Selection */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Icon
                  name="palette-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Thème</Text>
                <Text style={styles.settingDescription}>
                  {mode === 'light'
                    ? 'Clair'
                    : mode === 'dark'
                      ? 'Sombre'
                      : 'Système'}
                </Text>
              </View>
            </View>
          </View>

          {/* Theme Options */}
          <View style={styles.themeOptionContainer}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                mode === 'light' && styles.themeOptionActive,
              ]}
              onPress={() => setMode('light')}
              activeOpacity={0.7}
            >
              <View style={styles.themeOptionIcon}>
                <Icon
                  name="sunny"
                  size={18}
                  color={mode === 'light' ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.themeOptionText,
                  { color: mode === 'light' ? colors.primary : colors.textSecondary },
                ]}
              >
                Clair
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                mode === 'dark' && styles.themeOptionActive,
              ]}
              onPress={() => setMode('dark')}
              activeOpacity={0.7}
            >
              <View style={styles.themeOptionIcon}>
                <Icon
                  name="moon"
                  size={18}
                  color={mode === 'dark' ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.themeOptionText,
                  { color: mode === 'dark' ? colors.primary : colors.textSecondary },
                ]}
              >
                Sombre
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                mode === 'system' && styles.themeOptionActive,
              ]}
              onPress={() => setMode('system')}
              activeOpacity={0.7}
            >
              <View style={styles.themeOptionIcon}>
                <Icon
                  name="settings"
                  size={18}
                  color={mode === 'system' ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.themeOptionText,
                  { color: mode === 'system' ? colors.primary : colors.textSecondary },
                ]}
              >
                Système
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ACCOUNT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Icon
                  name="person-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Profil</Text>
                <Text style={styles.settingDescription}>
                  Gérer vos informations
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Icon
                  name="lock-closed-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Sécurité</Text>
                <Text style={styles.settingDescription}>
                  Mot de passe et authentification
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Icon
                  name="notifications-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>
                  Préférences des notifications
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ABOUT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Icon
                  name="information-circle-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>À propos de Buy&Sale</Text>
                <Text style={styles.settingDescription}>
                  Version 1.0.0
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Icon
                  name="help-circle-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Aide et support</Text>
                <Text style={styles.settingDescription}>
                  FAQ et support client
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Icon
                  name="document-text-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Conditions légales</Text>
                <Text style={styles.settingDescription}>
                  Politique de confidentialité
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* DANGER ZONE */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.settingItem, {
            backgroundColor: colors.error + '15',
            borderColor: colors.error,
          }]} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.error + '20' }]}>
                <Icon name="log-out-outline" size={20} color={colors.error} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: colors.error }]}>
                  Déconnexion
                </Text>
                <Text style={styles.settingDescription}>
                  Quitter votre compte
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Settings;