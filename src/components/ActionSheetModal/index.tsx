import React, { useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../contexts/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ActionSheetItem {
  label: string;
  icon: string;
  onPress: () => void;
  destructive?: boolean;
  requiresAuth?: boolean;
}

interface ActionSheetModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  items: ActionSheetItem[];
  isAuthenticated?: boolean;
  onRequireAuth?: () => void;
}

const ActionSheetModal: React.FC<ActionSheetModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  items,
  isAuthenticated = false,
  onRequireAuth,
}) => {
  const colors = useThemeColors();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 68,
          friction: 12,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleItemPress = (item: ActionSheetItem) => {
    if (item.requiresAuth && !isAuthenticated) {
      onClose();
      setTimeout(() => {
        onRequireAuth?.();
      }, 250);
      return;
    }
    onClose();
    setTimeout(() => {
      item.onPress();
    }, 250);
  };

  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropAnim }]}
        />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Handle */}
        <View style={styles.handleBar} />

        {/* Header */}
        {(title || subtitle) && (
          <View style={styles.header}>
            {title && (
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        )}

        {/* Divider */}
        {(title || subtitle) && <View style={styles.divider} />}

        {/* Action items */}
        <View style={styles.itemsContainer}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const itemColor = item.destructive
              ? colors.error
              : item.requiresAuth && !isAuthenticated
              ? colors.textSecondary
              : colors.text;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.item,
                  !isLast && styles.itemBorder,
                ]}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.6}
              >
                <View style={[styles.iconWrapper, item.destructive && styles.iconWrapperDestructive, item.requiresAuth && !isAuthenticated && styles.iconWrapperAuth]}>
                  <Icon name={item.icon} size={22} color={itemColor} />
                </View>
                <View style={styles.itemTextBlock}>
                  <Text style={[styles.itemLabel, { color: itemColor }]}>
                    {item.label}
                  </Text>
                  {item.requiresAuth && !isAuthenticated && (
                    <Text style={styles.authHint}>Connexion requise</Text>
                  )}
                </View>
                {!(item.requiresAuth && !isAuthenticated) && (
                  <Icon name="chevron-forward-outline" size={16} color={colors.textTertiary} />
                )}
                {item.requiresAuth && !isAuthenticated && (
                  <Icon name="lock-closed-outline" size={16} color={colors.textTertiary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Cancel */}
        <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.cancelLabel}>Annuler</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: 34,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 20,
    },
    handleBar: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 8,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 14,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderLight,
      marginHorizontal: 0,
    },
    itemsContainer: {
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 14,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: colors.background,
      gap: 14,
    },
    itemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    iconWrapper: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconWrapperDestructive: {
      backgroundColor: '#FEE2E2',
    },
    iconWrapperAuth: {
      backgroundColor: colors.backgroundTertiary,
      opacity: 0.7,
    },
    itemTextBlock: {
      flex: 1,
    },
    itemLabel: {
      fontSize: 15,
      fontWeight: '500',
    },
    authHint: {
      fontSize: 11,
      color: colors.textTertiary,
      marginTop: 2,
    },
    cancelButton: {
      marginHorizontal: 16,
      marginTop: 10,
      borderRadius: 14,
      backgroundColor: colors.backgroundSecondary,
      paddingVertical: 15,
      alignItems: 'center',
    },
    cancelLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
  });

export default ActionSheetModal;
