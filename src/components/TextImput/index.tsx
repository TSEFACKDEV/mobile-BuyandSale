import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  KeyboardType,
  ReturnKeyType,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles, { COLORS } from './style';

export interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  type?: 'email' | 'password' | 'phone' | 'otp' | 'text';
  error?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  editable?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  returnKeyType?: ReturnKeyType;
  onSubmitEditing?: () => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  type = 'text',
  error,
  disabled = false,
  required = false,
  maxLength,
  editable = true,
  style,
  inputStyle,
  leftIcon,
  onFocus,
  onBlur,
  returnKeyType = 'done',
  onSubmitEditing,
  autoCapitalize = 'none',
  autoCorrect = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getKeyboardType = (): KeyboardType => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      case 'otp':
        return 'number-pad';
      case 'password':
        return 'default';
      default:
        return 'default';
    }
  };

  const getLeftIcon = (): string | undefined => {
    if (leftIcon) return leftIcon;
    switch (type) {
      case 'email':
        return 'mail-outline';
      case 'password':
        return 'lock-closed-outline';
      case 'phone':
        return 'call-outline';
      case 'otp':
        return 'shield-checkmark-outline';
      default:
        return undefined;
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const containerStyle = [
    styles.container,
    disabled && styles.disabledContainer,
    style,
  ];

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error && styles.inputContainerError,
    disabled && styles.inputContainerDisabled,
  ];

  const inputTextStyle = [
    styles.input,
    inputStyle,
  ];

  const leftIconName = getLeftIcon();
  const isPasswordVisible = type === 'password' && showPassword;
  const secureTextEntry = type === 'password' && !showPassword;

  return (
    <View style={containerStyle}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      <View style={inputContainerStyle}>
        {leftIconName && (
          <Icon
            name={leftIconName}
            size={20}
            color={
              disabled
                ? COLORS.textLight
                : isFocused
                ? COLORS.primary
                : error
                ? COLORS.error
                : COLORS.textLight
            }
            style={styles.leftIcon}
          />
        )}

        <RNTextInput
          style={inputTextStyle}
          placeholder={placeholder || label}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChangeText}
          keyboardType={getKeyboardType()}
          secureTextEntry={secureTextEntry}
          editable={editable && !disabled}
          maxLength={type === 'otp' ? maxLength || 6 : maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          selectTextOnFocus
        />

        {type === 'password' && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
            disabled={disabled}
          >
            <Icon
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={disabled ? COLORS.textLight : COLORS.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Icon
            name="alert-circle-outline"
            size={16}
            color={COLORS.error}
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {type === 'otp' && value.length > 0 && (
        <View style={styles.charCountContainer}>
          <Text style={styles.charCountText}>
            {value.length}/{maxLength || 6}
          </Text>
        </View>
      )}
    </View>
  );
};

export default TextInput;