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
import { Category, CurrencyCode, PaymentMethod, Transaction, UserProfile, Workspace } from '../lib/types';

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'created_at'>) => void;
  initialType?: 'expense' | 'income' | 'investment' | 'bill';
  categories: Category[];
  paymentMethods: PaymentMethod[];
  profile: UserProfile;
  workspace: Workspace;
  currency: CurrencyCode;
  onAddNewCategory?: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  visible,
  onClose,
  onSave,
  initialType = 'expense',
  categories,
  paymentMethods,
  profile,
  workspace,
  currency,
  onAddNewCategory,
}) => {
  const [type, setType] = useState<'expense' | 'income' | 'investment' | 'bill'>(initialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    categories.find((c) => c.type === (initialType === 'income' ? 'income' : 'expense')) || categories[0] || null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(
    paymentMethods[0] || null
  );
  const [paidBy, setPaidBy] = useState<string>(profile.id);
  const [splitOption, setSplitOption] = useState<'me' | 'partner' | 'split'>('me');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const isCouple = workspace.type === 'couple';
  const partnerName = workspace.partner_name || 'Partner';
  const partnerId = workspace.partner_id || 'partner-id';

  const handleTypeChange = (newType: 'expense' | 'income' | 'investment' | 'bill') => {
    setType(newType);
    const matched = categories.find((c) => (newType === 'income' ? c.type === 'income' : c.type === 'expense'));
    if (matched) setSelectedCategory(matched);
  };

  const handleSave = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const numAmount = Number(amount);
    let finalPaidBy = profile.id;
    let finalPaidByName = profile.display_name || 'Me';

    if (splitOption === 'partner') {
      finalPaidBy = partnerId;
      finalPaidByName = partnerName;
    } else if (splitOption === 'split') {
      finalPaidBy = profile.id;
      finalPaidByName = 'Split (50/50)';
    }

    onSave({
      workspace_id: workspace.id,
      created_by: profile.id,
      created_by_name: profile.display_name || 'Me',
      created_by_avatar: profile.avatar_url,
      paid_by: finalPaidBy,
      paid_by_name: finalPaidByName,
      type: type,
      amount: numAmount,
      currency: currency,
      category_id: selectedCategory?.id,
      category_name: selectedCategory?.name || (type === 'income' ? 'Salary' : 'General'),
      category_color: selectedCategory?.color || '#6366F1',
      category_icon: selectedCategory?.icon || 'pricetag',
      payment_method_id: selectedPaymentMethod?.id,
      payment_method_name: selectedPaymentMethod?.name || 'Card',
      description: description.trim() || `${selectedCategory?.name || type} transaction`,
      transaction_date: date,
      is_bill: type === 'bill',
      is_paid: true,
    });

    // Reset fields
    setAmount('');
    setDescription('');
    setError('');
    onClose();
  };

  const filteredCategories = categories.filter((c) => {
    if (type === 'income') return c.type === 'income';
    return c.type === 'expense' || c.type === 'investment';
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Transaction</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={THEME.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Type Selector Tabs */}
            <View style={styles.typeSelector}>
              {(['expense', 'income', 'investment', 'bill'] as const).map((t) => {
                const isActive = type === t;
                const activeColor =
                  t === 'expense'
                    ? '#EF4444'
                    : t === 'income'
                    ? '#10B981'
                    : t === 'investment'
                    ? '#3B82F6'
                    : '#F59E0B';

                return (
                  <Pressable
                    key={t}
                    style={[
                      styles.typeTab,
                      isActive && { backgroundColor: activeColor, borderColor: activeColor },
                    ]}
                    onPress={() => handleTypeChange(t)}
                  >
                    <Text style={[styles.typeTabText, isActive && { color: '#FFF' }]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Big Amount Input */}
            <View style={styles.amountContainer}>
              <Text style={styles.currencyPrefix}>{currency === 'EUR' ? '€' : '₹'}</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={THEME.colors.textDim}
                keyboardType="numeric"
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  if (error) setError('');
                }}
                autoFocus
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Description Input */}
            <Text style={styles.inputLabel}>Description / Notes</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Grocery Mart, Romantic Dinner, Rent, WiFi"
              placeholderTextColor={THEME.colors.textDim}
              value={description}
              onChangeText={setDescription}
            />

            {/* Category Selector */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.inputLabel}>Category</Text>
              {onAddNewCategory && (
                <Pressable onPress={onAddNewCategory} style={styles.addCategoryLink}>
                  <Ionicons name="add" size={14} color={THEME.colors.primaryLight} />
                  <Text style={styles.addCategoryText}>New Category</Text>
                </Pressable>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      isSelected && {
                        backgroundColor: cat.color,
                        borderColor: cat.color,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <View
                      style={[
                        styles.categoryIconWrap,
                        { backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : cat.color + '25' },
                      ]}
                    >
                      <Ionicons
                        name={(cat.icon as any) || 'pricetag'}
                        size={14}
                        color={isSelected ? '#FFF' : cat.color}
                      />
                    </View>
                    <Text style={[styles.categoryChipText, isSelected && { color: '#FFF' }]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Who Paid / Payer Selector (Collaborative Couple Mode) */}
            {isCouple && (
              <View style={styles.payerSection}>
                <Text style={styles.inputLabel}>Who Paid for this?</Text>
                <View style={styles.payerRow}>
                  <Pressable
                    style={[
                      styles.payerChip,
                      splitOption === 'me' && {
                        backgroundColor: THEME.colors.partnerA,
                        borderColor: THEME.colors.partnerA,
                      },
                    ]}
                    onPress={() => setSplitOption('me')}
                  >
                    <Ionicons
                      name="person"
                      size={14}
                      color={splitOption === 'me' ? '#FFF' : THEME.colors.partnerA}
                    />
                    <Text style={[styles.payerChipText, splitOption === 'me' && { color: '#FFF' }]}>
                      {profile.display_name || 'Me'}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.payerChip,
                      splitOption === 'partner' && {
                        backgroundColor: THEME.colors.partnerB,
                        borderColor: THEME.colors.partnerB,
                      },
                    ]}
                    onPress={() => setSplitOption('partner')}
                  >
                    <Ionicons
                      name="heart"
                      size={14}
                      color={splitOption === 'partner' ? '#FFF' : THEME.colors.partnerB}
                    />
                    <Text style={[styles.payerChipText, splitOption === 'partner' && { color: '#FFF' }]}>
                      {partnerName}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.payerChip,
                      splitOption === 'split' && {
                        backgroundColor: THEME.colors.success,
                        borderColor: THEME.colors.success,
                      },
                    ]}
                    onPress={() => setSplitOption('split')}
                  >
                    <Ionicons
                      name="people"
                      size={14}
                      color={splitOption === 'split' ? '#FFF' : THEME.colors.success}
                    />
                    <Text style={[styles.payerChipText, splitOption === 'split' && { color: '#FFF' }]}>
                      Split 50/50
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Payment Method Selector */}
            <Text style={styles.inputLabel}>Payment Method</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {paymentMethods.map((pm) => {
                const isSelected = selectedPaymentMethod?.id === pm.id;
                return (
                  <Pressable
                    key={pm.id}
                    style={[
                      styles.methodChip,
                      isSelected && {
                        backgroundColor: THEME.colors.surfaceLight,
                        borderColor: THEME.colors.primaryLight,
                      },
                    ]}
                    onPress={() => setSelectedPaymentMethod(pm)}
                  >
                    <Ionicons
                      name={(pm.icon as any) || 'card-outline'}
                      size={14}
                      color={isSelected ? THEME.colors.primaryLight : THEME.colors.textMuted}
                    />
                    <Text style={[styles.methodChipText, isSelected && { color: '#FFF', fontWeight: '700' }]}>
                      {pm.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Date field */}
            <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={date}
              onChangeText={setDate}
              placeholder="2026-09-25"
              placeholderTextColor={THEME.colors.textDim}
            />

            {/* Save Button */}
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.saveBtnText}>Save Transaction</Text>
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
    marginBottom: 18,
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
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.card,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.card,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginBottom: 16,
  },
  currencyPrefix: {
    fontSize: 32,
    fontWeight: '900',
    color: THEME.colors.accentGold,
    marginRight: 6,
  },
  amountInput: {
    fontSize: 34,
    fontWeight: '900',
    color: THEME.colors.text,
    minWidth: 140,
    textAlign: 'left',
  },
  errorText: {
    color: THEME.colors.danger,
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: THEME.colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: THEME.colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addCategoryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addCategoryText: {
    fontSize: 12,
    color: THEME.colors.primaryLight,
    fontWeight: '700',
  },
  categoryScroll: {
    marginBottom: 14,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  categoryIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  payerSection: {
    marginBottom: 12,
  },
  payerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  payerChip: {
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
  payerChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  methodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  methodChipText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 18,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
