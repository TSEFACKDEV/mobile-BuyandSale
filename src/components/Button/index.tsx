import React from 'react';
import { 
  Pressable, 
  Text, 
  View, 
  ViewStyle, 
  TextStyle,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles, { COLORS } from './style';

export interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    disabled && styles.disabledButton,
    fullWidth && styles.fullWidthButton,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const getIconColor = () => {
    if (variant === 'primary') return COLORS.white;
    if (variant === 'secondary') return COLORS.white;
    if (variant === 'outline') return COLORS.primary;
    if (variant === 'danger') return COLORS.white;
    return COLORS.primary;
  };

  const getIconSize = () => {
    if (size === 'small') return 16;
    if (size === 'medium') return 18;
    if (size === 'large') return 20;
    return 18;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        ...buttonStyles,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator 
            color={variant === 'outline' ? COLORS.primary : COLORS.white} 
            size="small" 
          />
        ) : (
          <>
            {leftIcon && (
              <Icon 
                name={leftIcon} 
                size={getIconSize()} 
                color={getIconColor()}
                style={styles.leftIcon}
              />
            )}
            <Text style={textStyles}>{title}</Text>
            {rightIcon && (
              <Icon 
                name={rightIcon} 
                size={getIconSize()} 
                color={getIconColor()}
                style={styles.rightIcon}
              />
            )}
          </>
        )}
      </View>
    </Pressable>
  );
};

export default Button;