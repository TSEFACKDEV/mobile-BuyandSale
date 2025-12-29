import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../contexts/ThemeContext';
import createStyles from './style';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: {
    search: string;
    categoryId?: string;
    cityId?: string;
    priceMin?: number;
    priceMax?: number;
    etat?: 'NEUF' | 'OCCASION' | 'CORRECT';
  };
  onApplyFilters: (filters: any) => void;
  categories: Array<{ id: string; name: string }>;
  cities: Array<{ id: string; name: string }>;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApplyFilters,
  categories,
  cities,
}) => {
  const theme = useThemeColors();
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClearAll = () => {
    const clearedFilters = {
      search: filters.search, // Garder la recherche
      categoryId: undefined,
      cityId: undefined,
      priceMin: undefined,
      priceMax: undefined,
      etat: undefined,
    };
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (localFilters.categoryId) count++;
    if (localFilters.cityId) count++;
    if (localFilters.priceMin !== undefined) count++;
    if (localFilters.priceMax !== undefined) count++;
    if (localFilters.etat) count++;
    return count;
  };

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons name="filter-outline" size={20} color={theme.text} />
                <Text style={styles.headerTitle}>Filtres</Text>
                {activeFiltersCount() > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{activeFiltersCount()}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollContent}>
              {/* Catégorie */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Catégorie</Text>
                <ScrollView style={styles.categoriesScroll} nestedScrollEnabled>
                  <TouchableOpacity
                    style={styles.radioButton}
                    onPress={() => setLocalFilters({ ...localFilters, categoryId: undefined })}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        !localFilters.categoryId && styles.radioCircleSelected,
                      ]}
                    >
                      {!localFilters.categoryId && <View style={styles.radioCircleInner} />}
                    </View>
                    <Text style={styles.radioLabel}>Toutes les catégories</Text>
                  </TouchableOpacity>

                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.radioButton}
                      onPress={() =>
                        setLocalFilters({ ...localFilters, categoryId: category.id })
                      }
                    >
                      <View
                        style={[
                          styles.radioCircle,
                          localFilters.categoryId === category.id && styles.radioCircleSelected,
                        ]}
                      >
                        {localFilters.categoryId === category.id && (
                          <View style={styles.radioCircleInner} />
                        )}
                      </View>
                      <Text style={styles.radioLabel}>{category.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Ville */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ville</Text>
                <ScrollView style={styles.categoriesScroll} nestedScrollEnabled>
                  <TouchableOpacity
                    style={styles.radioButton}
                    onPress={() => setLocalFilters({ ...localFilters, cityId: undefined })}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        !localFilters.cityId && styles.radioCircleSelected,
                      ]}
                    >
                      {!localFilters.cityId && <View style={styles.radioCircleInner} />}
                    </View>
                    <Text style={styles.radioLabel}>Toutes les villes</Text>
                  </TouchableOpacity>

                  {cities.map((city) => (
                    <TouchableOpacity
                      key={city.id}
                      style={styles.radioButton}
                      onPress={() => setLocalFilters({ ...localFilters, cityId: city.id })}
                    >
                      <View
                        style={[
                          styles.radioCircle,
                          localFilters.cityId === city.id && styles.radioCircleSelected,
                        ]}
                      >
                        {localFilters.cityId === city.id && (
                          <View style={styles.radioCircleInner} />
                        )}
                      </View>
                      <Text style={styles.radioLabel}>{city.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Prix */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Prix (FCFA)</Text>
                <View style={styles.priceInputsContainer}>
                  <View style={styles.priceInputWrapper}>
                    <Text style={styles.inputLabel}>Min</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                      value={localFilters.priceMin?.toString() || ''}
                      onChangeText={(text) =>
                        setLocalFilters({
                          ...localFilters,
                          priceMin: text ? Number(text) : undefined,
                        })
                      }
                    />
                  </View>
                  <View style={styles.priceInputWrapper}>
                    <Text style={styles.inputLabel}>Max</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="∞"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                      value={localFilters.priceMax?.toString() || ''}
                      onChangeText={(text) =>
                        setLocalFilters({
                          ...localFilters,
                          priceMax: text ? Number(text) : undefined,
                        })
                      }
                    />
                  </View>
                </View>
              </View>

              {/* État */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>État</Text>
                <View style={styles.radioContainer}>
                  <TouchableOpacity
                    style={styles.radioButton}
                    onPress={() => setLocalFilters({ ...localFilters, etat: undefined })}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        !localFilters.etat && styles.radioCircleSelected,
                      ]}
                    >
                      {!localFilters.etat && <View style={styles.radioCircleInner} />}
                    </View>
                    <Text style={styles.radioLabel}>Tous les états</Text>
                  </TouchableOpacity>

                  {['NEUF', 'OCCASION', 'CORRECT'].map((etat) => (
                    <TouchableOpacity
                      key={etat}
                      style={styles.radioButton}
                      onPress={() =>
                        setLocalFilters({
                          ...localFilters,
                          etat: etat as 'NEUF' | 'OCCASION' | 'CORRECT',
                        })
                      }
                    >
                      <View
                        style={[
                          styles.radioCircle,
                          localFilters.etat === etat && styles.radioCircleSelected,
                        ]}
                      >
                        {localFilters.etat === etat && <View style={styles.radioCircleInner} />}
                      </View>
                      <Text style={styles.radioLabel}>
                        {etat === 'NEUF' ? 'Neuf' : etat === 'OCCASION' ? 'Occasion' : 'Correct'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              {activeFiltersCount() > 0 && (
                <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
                  <Text style={styles.clearButtonText}>Effacer tout</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.applyButton, activeFiltersCount() === 0 && { flex: 1 }]}
                onPress={handleApply}
              >
                <Text style={styles.applyButtonText}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default FilterModal;
