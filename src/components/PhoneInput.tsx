import React, { useState, useEffect } from 'react';
import { View, TextInput as RNTextInput, Text, ViewStyle, TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface PhoneInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  onFocus?: () => void;
  onBlur?: () => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  placeholder = '612345678',
  value,
  onChangeText,
  error,
  disabled = false,
  required = false,
  style,
  inputStyle,
  onFocus,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState('');

  // Extraire les chiffres après +237
  const extractDigits = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.startsWith('237') ? cleaned.slice(3) : cleaned;
  };

  // Synchroniser avec la valeur externe
  useEffect(() => {
    setDisplayValue(extractDigits(value));
  }, [value]);

  // Gérer les changements
  const handleChangeText = (text: string) => {
    if (!text.startsWith('+237 ')) return;

    const digits = text.replace('+237 ', '').replace(/\D/g, '');
    
    if (digits.length <= 9) {
      setDisplayValue(digits);
      onChangeText(digits ? `+237${digits}` : '');
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

  const isValid = displayValue.length === 9 && displayValue.startsWith('6');

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
        ]}
      >
        <Icon
          name="call-outline"
          size={20}
          color={disabled ? '#9CA3AF' : isFocused ? '#FF6F00' : error ? '#EF4444' : '#9CA3AF'}
          style={styles.leftIcon}
        />

        <RNTextInput
          style={[styles.input, inputStyle]}
          placeholder={`+237 ${placeholder}`}
          placeholderTextColor="#9CA3AF"
          value={`+237 ${displayValue}`}
          onChangeText={handleChangeText}
          keyboardType="phone-pad"
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={14}
          selectTextOnFocus={false}
        />
      </View>

      {error && (
        <View style={styles.messageContainer}>
          <Icon name="alert-circle-outline" size={16} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!error && isValid && displayValue && (
        <View style={styles.messageContainer}>
          <Icon name="checkmark-circle-outline" size={16} color="#10B981" />
          <Text style={styles.successText}>✓ Numéro valide</Text>
        </View>
      )}
    </View>
  );
};

const styles = {
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row' as 'row',
    alignItems: 'center' as 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputContainerFocused: {
    borderColor: '#FF6F00',
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  inputContainerDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 0,
  },
  messageContainer: {
    flexDirection: 'row' as 'row',
    alignItems: 'center' as 'center',
    marginTop: 6,
    gap: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
  },
  successText: {
    fontSize: 13,
    color: '#10B981',
  },
};

export default PhoneInput;
