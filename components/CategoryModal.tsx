import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PALETTE_COLORS, THEME } from '../lib/constants';
import { Category, Workspace } from '../lib/types';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (cat: Omit<Category, 'id'>) => void;
  workspace: Workspace;
}

const ICONS = [
  'pricetag',
  'cart',
  'restaurant',
  'game-controller',
  'airplane',
  'fitness',
  'color-palette',
  'car',
  'home',
  'cafe',
  'gift',
  'school',
  'shirt',
  'medkit',
  'paw',
  'wifi',
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  onClose,
  onSave,
  workspace,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [color, setColor] = useState('#6366F1');
  const [icon, setIcon] = useState('pricetag');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter a category name');
      return;
    }

    onSave({
      workspace_id: workspace.id,
      name: name.trim(),
      color: color,
      icon: icon,
      type: type,
      monthly_budget: monthlyBudget ? Number(monthlyBudget) : 0,
    });

    setName('');
    setMonthlyBudget('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Custom Category 🏷️</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={THEME.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Category Type */}
            <View style={styles.typeSelector}>
              <Pressable
                style={[styles.typeTab, type === 'expense' && { backgroundColor: '#EF4444' }]}
                onPress={() => setType('expense')}
              >
                <Text style={[styles.typeTabText, type === 'expense' && { color: '#FFF' }]}>Expense</Text>
              </Pressable>
              <Pressable
                style={[styles.typeTab, type === 'income' && { backgroundColor: '#10B981' }]}
                onPress={() => setType('income')}
              >
                <Text style={[styles.typeTabText, type === 'income' && { color: '#FFF' }]}>Income</Text>
              </Pressable>
            </View>

            {/* Category Name */}
            <Text style={styles.inputLabel}>Category Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Subscriptions, Pet Care, Coffee, Books"
              placeholderTextColor={THEME.colors.textDim}
              value={name}
              onChangeText={setName}
            />

            {/* Monthly Budget Limit */}
            <Text style={styles.inputLabel}>Monthly Budget Limit (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 5000"
              placeholderTextColor={THEME.colors.textDim}
              keyboardType="numeric"
              value={monthlyBudget}
              onChangeText={setMonthlyBudget}
            />

            {/* Color Palette */}
            <Text style={styles.inputLabel}>Pick Category Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rowScroll}>
              {PALETTE_COLORS.map((col) => (
                <Pressable
                  key={col}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: col },
                    color === col && styles.selectedColorCircle,
                  ]}
                  onPress={() => setColor(col)}
                />
              ))}
            </ScrollView>

            {/* Icon Picker */}
            <Text style={styles.inputLabel}>Pick Category Icon</Text>
            <View style={styles.iconGrid}>
              {ICONS.map((ic) => (
                <Pressable
                  key={ic}
                  style={[
                    styles.iconChip,
                    icon === ic && { backgroundColor: color, borderColor: color },
                  ]}
                  onPress={() => setIcon(ic)}
                >
                  <Ionicons
                    name={ic as any}
                    size={20}
                    color={icon === ic ? '#FFF' : THEME.colors.textMuted}
                  />
                </Pressable>
              ))}
            </View>

            <Pressable style={[styles.saveBtn, { backgroundColor: color }]} onPress={handleSave}>
              <Ionicons name="checkmark-circle" size={18} color="#FFF" />
              <Text style={styles.saveBtnText}>Create Category</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingBottom: 24,
  },
  errorText: {
    color: THEME.colors.danger,
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.card,
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: THEME.colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: THEME.colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    marginBottom: 8,
  },
  rowScroll: {
    marginBottom: 12,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  selectedColorCircle: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 10,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
