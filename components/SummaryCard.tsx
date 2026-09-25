import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, formatCurrency } from '../lib/constants';
import { CurrencyCode, Transaction, UserProfile, Workspace } from '../lib/types';

interface SummaryCardProps {
  transactions: Transaction[];
  profile: UserProfile;
  workspace: Workspace;
  currency: CurrencyCode;
  onAddExpense: () => void;
  onAddIncome: () => void;
  onAddInvestment: () => void;
  onAddGoal: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  transactions,
  profile,
  workspace,
  currency,
  onAddExpense,
  onAddIncome,
  onAddInvestment,
  onAddGoal,
}) => {
  const isCouple = workspace.type === 'couple';

  // Calculate monthly stats
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthlyTxs = transactions.filter((t) => t.transaction_date.startsWith(currentMonthPrefix));

  const totalIncome = monthlyTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = monthlyTxs
    .filter((t) => t.type === 'expense' || t.type === 'bill')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalInvested = monthlyTxs
    .filter((t) => t.type === 'investment')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // Breakdown by partner
  const userExpense = monthlyTxs
    .filter((t) => (t.type === 'expense' || t.type === 'bill') && t.paid_by === profile.id)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const partnerExpense = totalExpense - userExpense;

  const userSharePct = totalExpense > 0 ? Math.round((userExpense / totalExpense) * 100) : 50;
  const partnerSharePct = 100 - userSharePct;

  return (
    <View style={styles.cardContainer}>
      {/* Top Header / Month Badge */}
      <View style={styles.topHeader}>
        <View style={styles.monthBadge}>
          <Ionicons name="calendar-outline" size={13} color={THEME.colors.primaryLight} />
          <Text style={styles.monthText}>
            {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        <View style={styles.savingsRateBadge}>
          <Ionicons name="sparkles" size={13} color={THEME.colors.accentGold} />
          <Text style={styles.savingsRateText}>{savingsRate}% Saved</Text>
        </View>
      </View>

      {/* Main Net Savings & Spent Numbers */}
      <View style={styles.mainStatsRow}>
        <View>
          <Text style={styles.netSavingsLabel}>Total Net Balance</Text>
          <Text style={styles.netSavingsAmount}>{formatCurrency(netSavings, currency)}</Text>
        </View>
        <View style={styles.badgeMonthlySpend}>
          <Text style={styles.spentLabel}>Spent this month</Text>
          <Text style={styles.spentAmount}>{formatCurrency(totalExpense, currency)}</Text>
        </View>
      </View>

      {/* Income & Investments Pill Row */}
      <View style={styles.secondaryStatsRow}>
        <View style={styles.statPill}>
          <View style={[styles.statDot, { backgroundColor: THEME.colors.success }]} />
          <Text style={styles.statPillLabel}>Income: </Text>
          <Text style={[styles.statPillValue, { color: THEME.colors.success }]}>
            {formatCurrency(totalIncome, currency)}
          </Text>
        </View>

        <View style={styles.statPill}>
          <View style={[styles.statDot, { backgroundColor: THEME.colors.primaryLight }]} />
          <Text style={styles.statPillLabel}>Invested: </Text>
          <Text style={[styles.statPillValue, { color: THEME.colors.primaryLight }]}>
            {formatCurrency(totalInvested, currency)}
          </Text>
        </View>
      </View>

      {/* Couple Contribution Progress Bar */}
      {isCouple && totalExpense > 0 && (
        <View style={styles.coupleSplitSection}>
          <View style={styles.coupleSplitLabels}>
            <View style={styles.partnerLabelRow}>
              <View style={[styles.miniDot, { backgroundColor: THEME.colors.partnerA }]} />
              <Text style={styles.partnerNameText}>{profile.display_name || 'You'}: {userSharePct}%</Text>
              <Text style={styles.partnerAmountText}>({formatCurrency(userExpense, currency)})</Text>
            </View>

            <View style={styles.partnerLabelRow}>
              <View style={[styles.miniDot, { backgroundColor: THEME.colors.partnerB }]} />
              <Text style={styles.partnerNameText}>{workspace.partner_name || 'Partner'}: {partnerSharePct}%</Text>
              <Text style={styles.partnerAmountText}>({formatCurrency(partnerExpense, currency)})</Text>
            </View>
          </View>

          {/* Bi-Color Bar */}
          <View style={styles.splitBarTrack}>
            <View style={[styles.splitBarFillA, { width: `${userSharePct}%` }]} />
            <View style={[styles.splitBarFillB, { width: `${partnerSharePct}%` }]} />
          </View>
        </View>
      )}

      {/* Fast Action Buttons */}
      <View style={styles.actionGrid}>
        <Pressable style={[styles.actionBtn, styles.expenseBtn]} onPress={onAddExpense}>
          <View style={styles.actionIconWrap}>
            <Ionicons name="remove-circle" size={18} color="#EF4444" />
          </View>
          <Text style={styles.actionBtnText}>Expense</Text>
        </Pressable>

        <Pressable style={[styles.actionBtn, styles.incomeBtn]} onPress={onAddIncome}>
          <View style={styles.actionIconWrap}>
            <Ionicons name="add-circle" size={18} color="#10B981" />
          </View>
          <Text style={styles.actionBtnText}>Income</Text>
        </Pressable>

        <Pressable style={[styles.actionBtn, styles.investBtn]} onPress={onAddInvestment}>
          <View style={styles.actionIconWrap}>
            <Ionicons name="trending-up" size={18} color="#3B82F6" />
          </View>
          <Text style={styles.actionBtnText}>Invest</Text>
        </Pressable>

        <Pressable style={[styles.actionBtn, styles.goalBtn]} onPress={onAddGoal}>
          <View style={styles.actionIconWrap}>
            <Ionicons name="trophy" size={18} color="#EC4899" />
          </View>
          <Text style={styles.actionBtnText}>Goal</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  monthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  monthText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primaryLight,
  },
  savingsRateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  savingsRateText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.accentGold,
  },
  mainStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  netSavingsLabel: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  netSavingsAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: THEME.colors.text,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  badgeMonthlySpend: {
    alignItems: 'flex-end',
  },
  spentLabel: {
    fontSize: 11,
    color: THEME.colors.textDim,
    fontWeight: '600',
  },
  spentAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F87171',
  },
  secondaryStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statPillLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  statPillValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  coupleSplitSection: {
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  coupleSplitLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  partnerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  partnerNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  partnerAmountText: {
    fontSize: 10,
    color: THEME.colors.textDim,
  },
  splitBarTrack: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: THEME.colors.surfaceLight,
  },
  splitBarFillA: {
    height: '100%',
    backgroundColor: THEME.colors.partnerA,
  },
  splitBarFillB: {
    height: '100%',
    backgroundColor: THEME.colors.partnerB,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: THEME.colors.surfaceLight,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  expenseBtn: {},
  incomeBtn: {},
  investBtn: {},
  goalBtn: {},
  actionIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.text,
  },
});
