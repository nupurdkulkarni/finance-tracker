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
import { THEME } from '../lib/constants';
import { Bill, Category, CurrencyCode, UserProfile, Workspace } from '../lib/types';

interface BillModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (bill: Omit<Bill, 'id'>) => void;
  categories: Category[];
  profile: UserProfile;
  workspace: Workspace;
  currency: CurrencyCode;
}

export const BillModal: React.FC<BillModalProps> = ({
  visible,
  onClose,
  onSave,
  categories,
  profile,
  workspace,
  currency,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('2026-09-30');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    categories.find((c) => c.name.toLowerCase().includes('bill')) || categories[0] || null
  );
  const [assignedTo, setAssignedTo] = useState(profile.id);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const isCouple = workspace.type === 'couple';
  const partnerName = workspace.partner_name || 'Partner';
  const partnerId = workspace.partner_id || 'partner-id';

  const handleSave = () => {
    if (!title.trim()) {
      setError('Please enter a bill title');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const isMe = assignedTo === profile.id;

    onSave({
      workspace_id: workspace.id,
      title: title.trim(),
      amount: Number(amount),
      currency: currency,
      due_date: dueDate,
      is_paid: false,
      category_id: selectedCategory?.id,
      category_name: selectedCategory?.name || 'Bills & Utilities',
      category_color: selectedCategory?.color || '#64748B',
      assigned_to: assignedTo,
      assigned_to_name: isMe ? (profile.display_name || 'Me') : partnerName,
      notes: notes.trim(),
    });

    setTitle('');
    setAmount('');
    setNotes('');
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
            <View style={styles.headerTitleWrap}>
              <Ionicons name="receipt-outline" size={22} color={THEME.colors.accent} />
              <Text style={styles.modalTitle}>Add Upcoming Bill 💳</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={THEME.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Title */}
            <Text style={styles.inputLabel}>Bill / Subscription Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. WiFi Fiber, Electricity, Netflix Couple, Health Insurance"
              placeholderTextColor={THEME.colors.textDim}
              value={title}
              onChangeText={setTitle}
            />

            {/* Amount */}
            <Text style={styles.inputLabel}>Amount Due ({currency === 'EUR' ? '€' : '₹'})</Text>
            <TextInput
              style={styles.textInput}
              placeholder="1500"
              placeholderTextColor={THEME.colors.textDim}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            {/* Due Date */}
            <Text style={styles.inputLabel}>Due Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="2026-09-30"
              placeholderTextColor={THEME.colors.textDim}
            />

            {/* Assigned to Person */}
            {isCouple && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.inputLabel}>Assigned to Pay</Text>
                <View style={styles.ownerRow}>
                  <Pressable
                    style={[
                      styles.ownerChip,
                      assignedTo === profile.id && {
                        backgroundColor: THEME.colors.partnerA,
                        borderColor: THEME.colors.partnerA,
                      },
                    ]}
                    onPress={() => setAssignedTo(profile.id)}
                  >
                    <Ionicons name="person" size={14} color="#FFF" />
                    <Text style={styles.ownerChipText}>{profile.display_name || 'Me'}</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.ownerChip,
                      assignedTo === partnerId && {
                        backgroundColor: THEME.colors.partnerB,
                        borderColor: THEME.colors.partnerB,
                      },
                    ]}
                    onPress={() => setAssignedTo(partnerId)}
                  >
                    <Ionicons name="heart" size={14} color="#FFF" />
                    <Text style={styles.ownerChipText}>{partnerName}</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Category */}
            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {categories.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.catChip,
                      isSelected && { backgroundColor: cat.color, borderColor: cat.color },
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={[styles.catChipText, isSelected && { color: '#FFF' }]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Notes */}
            <Text style={styles.inputLabel}>Reminder Notes / Auto-pay info</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Set on Auto-Debit via Credit Card"
              placeholderTextColor={THEME.colors.textDim}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Save Bill Button */}
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="add-circle" size={18} color="#FFF" />
              <Text style={styles.saveBtnText}>Track Bill</Text>
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
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  ownerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ownerChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  ownerChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  catScroll: {
    marginBottom: 12,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: THEME.colors.card,
    marginRight: 6,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.accent,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 14,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
