import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../lib/constants';
import { Category, FilterOptions, Workspace } from '../lib/types';

interface FilterBarProps {
  filters: FilterOptions;
  categories: Category[];
  workspace: Workspace;
  onUpdateFilters: (newFilters: Partial<FilterOptions>) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  categories,
  workspace,
  onUpdateFilters,
  onResetFilters,
}) => {
  const isCouple = workspace.type === 'couple';
  const hasActiveFilters =
    filters.searchQuery ||
    filters.period !== 'all' ||
    filters.type !== 'all' ||
    filters.categoryId ||
    filters.paidBy !== 'all';

  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={THEME.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions, bills, stores..."
            placeholderTextColor={THEME.colors.textDim}
            value={filters.searchQuery}
            onChangeText={(text) => onUpdateFilters({ searchQuery: text })}
          />
          {filters.searchQuery ? (
            <Pressable onPress={() => onUpdateFilters({ searchQuery: '' })}>
              <Ionicons name="close-circle" size={16} color={THEME.colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {hasActiveFilters && (
          <Pressable style={styles.resetBtn} onPress={onResetFilters}>
            <Text style={styles.resetBtnText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {/* Filter Chips Horizontal Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {/* Period Filter */}
        {(['all', 'this_month', 'last_month', 'this_year'] as const).map((period) => (
          <Pressable
            key={period}
            style={[
              styles.filterChip,
              filters.period === period && styles.activeFilterChip,
            ]}
            onPress={() => onUpdateFilters({ period })}
          >
            <Text
              style={[
                styles.filterChipText,
                filters.period === period && styles.activeFilterChipText,
              ]}
            >
              {period === 'all'
                ? 'All Time'
                : period === 'this_month'
                ? 'This Month'
                : period === 'last_month'
                ? 'Last Month'
                : 'This Year'}
            </Text>
          </Pressable>
        ))}

        {/* Payer Filter (in Couple Mode) */}
        {isCouple &&
          (['all', 'me', 'partner'] as const).map((payer) => (
            <Pressable
              key={payer}
              style={[
                styles.filterChip,
                filters.paidBy === payer && styles.activeFilterChip,
              ]}
              onPress={() => onUpdateFilters({ paidBy: payer })}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filters.paidBy === payer && styles.activeFilterChipText,
                ]}
              >
                {payer === 'all' ? 'All Payers' : payer === 'me' ? 'Paid by Me' : `Paid by ${workspace.partner_name || 'Partner'}`}
              </Text>
            </Pressable>
          ))}

        {/* Type Filter */}
        {(['expense', 'income', 'investment', 'bill'] as const).map((type) => (
          <Pressable
            key={type}
            style={[
              styles.filterChip,
              filters.type === type && styles.activeFilterChip,
            ]}
            onPress={() => onUpdateFilters({ type: filters.type === type ? 'all' : type })}
          >
            <Text
              style={[
                styles.filterChipText,
                filters.type === type && styles.activeFilterChipText,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.text,
    paddingVertical: 0,
  },
  resetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: THEME.colors.surfaceLight,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textDim,
  },
  filterScroll: {
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: THEME.colors.card,
    marginRight: 6,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  activeFilterChip: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  activeFilterChipText: {
    color: '#FFF',
  },
});
