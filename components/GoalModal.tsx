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
import { PALETTE_COLORS, THEME, formatCurrency } from '../lib/constants';
import { CurrencyCode, FinancialGoal, UserProfile, Workspace } from '../lib/types';

interface GoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (goal: Omit<FinancialGoal, 'id'>) => void;
  profile: UserProfile;
  workspace: Workspace;
  currency: CurrencyCode;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  visible,
  onClose,
  onSave,
  profile,
  workspace,
  currency,
}) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2027-12-31');
  const [category, setCategory] = useState('Dream Project');
  const [color, setColor] = useState('#EC4899');
  const [isShared, setIsShared] = useState(true);
  const [icon, setIcon] = useState('trophy');
  const [error, setError] = useState('');

  const GOAL_ICONS = ['trophy', 'airplane', 'home', 'car-sport', 'shield-checkmark', 'heart', 'ring', 'sparkles'];

  const handleSave = () => {
    if (!title.trim()) {
      setError('Please enter a goal title');
      return;
    }
    if (!targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
      setError('Please enter a valid target amount');
      return;
    }

    onSave({
      workspace_id: workspace.id,
      title: title.trim(),
      target_amount: Number(targetAmount),
      current_amount: Number(currentAmount) || 0,
      currency: currency,
      target_date: targetDate,
      category: category,
      icon: icon,
      color: color,
      is_shared: isShared,
      created_by: profile.id,
      created_by_name: isShared ? `${profile.display_name} & ${workspace.partner_name || 'Partner'}` : profile.display_name,
    });

    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
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
            <Text style={styles.modalTitle}>New Finance Goal 🎯</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={THEME.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Goal Title */}
            <Text style={styles.inputLabel}>Goal Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Dream Paris Vacation, House Downpayment, Wedding"
              placeholderTextColor={THEME.colors.textDim}
              value={title}
              onChangeText={setTitle}
            />

            {/* Target Amount */}
            <Text style={styles.inputLabel}>Target Amount ({currency === 'EUR' ? '€' : '₹'})</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 500000"
              placeholderTextColor={THEME.colors.textDim}
              keyboardType="numeric"
              value={targetAmount}
              onChangeText={setTargetAmount}
            />

            {/* Already Saved Amount */}
            <Text style={styles.inputLabel}>Already Saved (Optional Initial Deposit)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0"
              placeholderTextColor={THEME.colors.textDim}
              keyboardType="numeric"
              value={currentAmount}
              onChangeText={setCurrentAmount}
            />

            {/* Target Date */}
            <Text style={styles.inputLabel}>Target Deadline (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="2027-12-31"
              placeholderTextColor={THEME.colors.textDim}
            />

            {/* Icon Picker */}
            <Text style={styles.inputLabel}>Goal Badge Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rowScroll}>
              {GOAL_ICONS.map((ic) => (
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
                    size={18}
                    color={icon === ic ? '#FFF' : THEME.colors.textMuted}
                  />
                </Pressable>
              ))}
            </ScrollView>

            {/* Color Tag Picker */}
            <Text style={styles.inputLabel}>Color Accent</Text>
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

            {/* Shared vs Individual */}
            <Text style={styles.inputLabel}>Goal Ownership</Text>
            <View style={styles.ownershipRow}>
              <Pressable
                style={[
                  styles.ownershipChip,
                  isShared && { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
                ]}
                onPress={() => setIsShared(true)}
              >
                <Ionicons name="heart" size={14} color={isShared ? '#FFF' : THEME.colors.secondary} />
                <Text style={[styles.ownershipText, isShared && { color: '#FFF' }]}>
                  Shared Couple Goal
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.ownershipChip,
                  !isShared && { backgroundColor: THEME.colors.surfaceLight, borderColor: THEME.colors.primaryLight },
                ]}
                onPress={() => setIsShared(false)}
              >
                <Ionicons name="person" size={14} color={!isShared ? THEME.colors.primaryLight : THEME.colors.textMuted} />
                <Text style={[styles.ownershipText, !isShared && { color: '#FFF' }]}>
                  Personal Goal
                </Text>
              </Pressable>
            </View>

            {/* Save Goal Button */}
            <Pressable style={[styles.saveBtn, { backgroundColor: color }]} onPress={handleSave}>
              <Ionicons name="flag" size={18} color="#FFF" />
              <Text style={styles.saveBtnText}>Set Finance Goal</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export const ContributeModal: React.FC<{
  visible: boolean;
  goal: FinancialGoal | null;
  currency: CurrencyCode;
  onClose: () => void;
  onContribute: (goalId: string, amount: number) => void;
}> = ({ visible, goal, currency, onClose, onContribute }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  if (!goal) return null;

  const neededMore = Math.max(0, goal.target_amount - goal.current_amount);

  const handleSubmit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }
    onContribute(goal.id, Number(amount));
    setAmount('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.contributeCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Contribute to Goal</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={THEME.colors.textMuted} />
            </Pressable>
          </View>

          <View style={[styles.goalInfoPill, { borderColor: goal.color }]}>
            <Ionicons name={(goal.icon as any) || 'trophy'} size={20} color={goal.color} />
            <View style={{ flex: 1 }}>
              <Text style={styles.goalInfoTitle}>{goal.title}</Text>
              <Text style={styles.goalInfoSub}>
                Needed more: <Text style={{ color: THEME.colors.accentGold, fontWeight: '800' }}>{formatCurrency(neededMore, currency)}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.currencyPrefix}>{currency === 'EUR' ? '€' : '₹'}</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="5000"
              placeholderTextColor={THEME.colors.textDim}
              keyboardType="numeric"
              value={amount}
              onChangeText={(t) => {
                setAmount(t);
                if (error) setError('');
              }}
              autoFocus
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Quick Amount Suggestion Chips */}
          <View style={styles.quickChipRow}>
            {[1000, 5000, 10000, 25000].map((quick) => (
              <Pressable
                key={quick}
                style={styles.quickChip}
                onPress={() => setAmount(String(quick))}
              >
                <Text style={styles.quickChipText}>+{formatCurrency(quick, currency)}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={[styles.saveBtn, { backgroundColor: goal.color }]} onPress={handleSubmit}>
            <Ionicons name="sparkles" size={18} color="#FFF" />
            <Text style={styles.saveBtnText}>Add to Savings</Text>
          </Pressable>
        </View>
      </View>
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
  contributeCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 24,
    margin: 20,
    padding: 24,
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
    marginBottom: 8,
  },
  rowScroll: {
    marginBottom: 12,
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
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
  ownershipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  ownershipChip: {
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
  ownershipText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 16,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  goalInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: THEME.colors.card,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  goalInfoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  goalInfoSub: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.card,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginBottom: 14,
  },
  currencyPrefix: {
    fontSize: 28,
    fontWeight: '900',
    color: THEME.colors.accentGold,
    marginRight: 6,
  },
  amountInput: {
    fontSize: 30,
    fontWeight: '900',
    color: THEME.colors.text,
    minWidth: 120,
  },
  quickChipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 10,
  },
  quickChip: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: THEME.colors.surfaceLight,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primaryLight,
  },
});
