import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, formatCurrency } from '../lib/constants';
import { CurrencyCode, FinancialGoal, StockInvestment, Transaction, UserProfile, Workspace } from '../lib/types';

interface ChartsProps {
  transactions: Transaction[];
  goals: FinancialGoal[];
  investments: StockInvestment[];
  profile: UserProfile;
  workspace: Workspace;
  currency: CurrencyCode;
  onOpenContributeModal?: (goal: FinancialGoal) => void;
}

export const Charts: React.FC<ChartsProps> = ({
  transactions,
  goals,
  investments,
  profile,
  workspace,
  currency,
  onOpenContributeModal,
}) => {
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('monthly');
  const [activeChartTab, setActiveChartTab] = useState<'savings' | 'expenses' | 'goals' | 'stocks'>('savings');

  const isCouple = workspace.type === 'couple';
  const partnerName = workspace.partner_name || 'Partner';
  const partnerId = workspace.partner_id || 'partner-id';

  // Compute stats based on timeframe
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthPrefix = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const filteredTxs = transactions.filter((t) => {
    if (timeframe === 'monthly') return t.transaction_date.startsWith(currentMonthPrefix);
    return t.transaction_date.startsWith(`${currentYear}`);
  });

  // 1. Income & Expense breakdown
  const totalIncome = filteredTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = filteredTxs
    .filter((t) => t.type === 'expense' || t.type === 'bill')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalInvested = filteredTxs
    .filter((t) => t.type === 'investment')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Individual vs Partner Expenses
  const userExpenses = filteredTxs
    .filter((t) => (t.type === 'expense' || t.type === 'bill') && t.paid_by === profile.id)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const partnerExpenses = totalExpense - userExpenses;

  // Individual vs Partner Incomes
  const userIncome = filteredTxs
    .filter((t) => t.type === 'income' && t.created_by === profile.id)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const partnerIncome = totalIncome - userIncome;

  // Individual vs Together Savings
  const userSavings = userIncome - userExpenses;
  const partnerSavings = partnerIncome - partnerExpenses;
  const togetherSavings = totalIncome - totalExpense;

  // Stock Market Portfolio breakdown
  const userStockInvested = investments
    .filter((inv) => inv.user_id === profile.id)
    .reduce((sum, inv) => sum + Number(inv.invested_amount), 0);

  const partnerStockInvested = investments
    .filter((inv) => inv.user_id !== profile.id)
    .reduce((sum, inv) => sum + Number(inv.invested_amount), 0);

  const totalStockInvested = userStockInvested + partnerStockInvested;

  const totalStockCurrentValue = investments.reduce((sum, inv) => sum + Number(inv.current_value || inv.invested_amount), 0);
  const totalStockGain = totalStockCurrentValue - totalStockInvested;

  // Category Expense Breakdown
  const categoryMap: { [name: string]: { name: string; amount: number; color: string } } = {};
  filteredTxs
    .filter((t) => t.type === 'expense' || t.type === 'bill')
    .forEach((t) => {
      const catName = t.category_name || 'Other';
      if (!categoryMap[catName]) {
        categoryMap[catName] = {
          name: catName,
          amount: 0,
          color: t.category_color || '#6366F1',
        };
      }
      categoryMap[catName].amount += Number(t.amount);
    });

  const categoryList = Object.values(categoryMap).sort((a, b) => b.amount - a.amount);

  return (
    <View style={styles.container}>
      {/* Timeframe & Sub-Tab Switcher */}
      <View style={styles.headerRow}>
        <View style={styles.timeframeToggle}>
          <Pressable
            style={[styles.timeBtn, timeframe === 'monthly' && styles.activeTimeBtn]}
            onPress={() => setTimeframe('monthly')}
          >
            <Text style={[styles.timeBtnText, timeframe === 'monthly' && styles.activeTimeBtnText]}>
              This Month
            </Text>
          </Pressable>

          <Pressable
            style={[styles.timeBtn, timeframe === 'yearly' && styles.activeTimeBtn]}
            onPress={() => setTimeframe('yearly')}
          >
            <Text style={[styles.timeBtnText, timeframe === 'yearly' && styles.activeTimeBtnText]}>
              Year {currentYear}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Analytics Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartTabScroll}>
        {[
          { id: 'savings', label: 'Savings Matrix', icon: 'wallet-outline' },
          { id: 'expenses', label: 'Expenses & Split', icon: 'pie-chart-outline' },
          { id: 'goals', label: 'Goal Targets', icon: 'trophy-outline' },
          { id: 'stocks', label: 'Stock Portfolio', icon: 'trending-up-outline' },
        ].map((tab) => (
          <Pressable
            key={tab.id}
            style={[
              styles.chartTab,
              activeChartTab === tab.id && styles.activeChartTab,
            ]}
            onPress={() => setActiveChartTab(tab.id as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={15}
              color={activeChartTab === tab.id ? '#FFF' : THEME.colors.textMuted}
            />
            <Text style={[styles.chartTabText, activeChartTab === tab.id && styles.activeChartTabText]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* 1. SAVINGS MATRIX (Individual & Together Savings Plots) */}
      {activeChartTab === 'savings' && (
        <View style={styles.chartCard}>
          <Text style={styles.cardHeading}>Individual & Together Savings Plot</Text>
          <Text style={styles.cardSub}>
            Comparison of personal retained savings and combined couple wealth build.
          </Text>

          {/* Together Total Savings Hero */}
          <View style={styles.togetherBanner}>
            <View>
              <Text style={styles.togetherLabel}>Together Combined Savings</Text>
              <Text style={styles.togetherAmount}>{formatCurrency(togetherSavings, currency)}</Text>
            </View>
            <View style={styles.growthBadge}>
              <Ionicons name="sparkles" size={14} color={THEME.colors.accentGold} />
              <Text style={styles.growthText}>
                {totalIncome > 0 ? `${Math.round((togetherSavings / totalIncome) * 100)}% Saved` : '0%'}
              </Text>
            </View>
          </View>

          {/* Individual Savings Comparison Bars */}
          <View style={styles.barComparisonBox}>
            {/* User A */}
            <View style={styles.barItem}>
              <View style={styles.barLabelRow}>
                <View style={styles.legendLeft}>
                  <View style={[styles.colorDot, { backgroundColor: THEME.colors.partnerA }]} />
                  <Text style={styles.legendName}>{profile.display_name || 'You'}</Text>
                </View>
                <Text style={styles.barValue}>{formatCurrency(userSavings, currency)}</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.max(5, Math.min(100, (userSavings / (Math.max(togetherSavings, 1) || 1)) * 100))}%`,
                      backgroundColor: THEME.colors.partnerA,
                    },
                  ]}
                />
              </View>
            </View>

            {/* User B (Partner) */}
            {isCouple && (
              <View style={styles.barItem}>
                <View style={styles.barLabelRow}>
                  <View style={styles.legendLeft}>
                    <View style={[styles.colorDot, { backgroundColor: THEME.colors.partnerB }]} />
                    <Text style={styles.legendName}>{partnerName}</Text>
                  </View>
                  <Text style={styles.barValue}>{formatCurrency(partnerSavings, currency)}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.max(5, Math.min(100, (partnerSavings / (Math.max(togetherSavings, 1) || 1)) * 100))}%`,
                        backgroundColor: THEME.colors.partnerB,
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Together Combined Bar */}
            <View style={styles.barItem}>
              <View style={styles.barLabelRow}>
                <View style={styles.legendLeft}>
                  <View style={[styles.colorDot, { backgroundColor: THEME.colors.success }]} />
                  <Text style={styles.legendName}>Together Combined</Text>
                </View>
                <Text style={[styles.barValue, { color: THEME.colors.success }]}>
                  {formatCurrency(togetherSavings, currency)}
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: '100%', backgroundColor: THEME.colors.success }]} />
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 2. EXPENSES & SPLIT BREAKDOWN */}
      {activeChartTab === 'expenses' && (
        <View style={styles.chartCard}>
          <Text style={styles.cardHeading}>Individual & Combined Spending</Text>
          <Text style={styles.cardSub}>
            Track who paid how much and where your combined funds went.
          </Text>

          {/* Bi-color Partner Split Bar */}
          {isCouple && totalExpense > 0 && (
            <View style={styles.partnerSplitBox}>
              <View style={styles.splitValuesRow}>
                <View>
                  <Text style={[styles.partnerSplitName, { color: THEME.colors.partnerA }]}>
                    {profile.display_name || 'You'} ({Math.round((userExpenses / totalExpense) * 100)}%)
                  </Text>
                  <Text style={styles.partnerSplitVal}>{formatCurrency(userExpenses, currency)}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.partnerSplitName, { color: THEME.colors.partnerB }]}>
                    {partnerName} ({Math.round((partnerExpenses / totalExpense) * 100)}%)
                  </Text>
                  <Text style={styles.partnerSplitVal}>{formatCurrency(partnerExpenses, currency)}</Text>
                </View>
              </View>

              <View style={styles.splitBarLarge}>
                <View
                  style={[
                    styles.splitPartA,
                    { width: `${Math.round((userExpenses / totalExpense) * 100)}%` },
                  ]}
                />
                <View
                  style={[
                    styles.splitPartB,
                    { width: `${Math.round((partnerExpenses / totalExpense) * 100)}%` },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Category-wise spending list */}
          <Text style={styles.catHeading}>Category Breakdown</Text>
          <View style={styles.catBreakdownList}>
            {categoryList.map((cat) => {
              const pct = totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0;
              return (
                <View key={cat.name} style={styles.catRow}>
                  <View style={styles.catLeft}>
                    <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                    <Text style={styles.catName}>{cat.name}</Text>
                  </View>
                  <View style={styles.catBarWrapper}>
                    <View style={styles.catBarBg}>
                      <View style={[styles.catBarFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
                    </View>
                  </View>
                  <View style={styles.catRight}>
                    <Text style={styles.catAmount}>{formatCurrency(cat.amount, currency)}</Text>
                    <Text style={styles.catPct}>{pct}%</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* 3. GOALS & HOW MUCH AMOUNT NEEDED MORE */}
      {activeChartTab === 'goals' && (
        <View style={styles.chartCard}>
          <Text style={styles.cardHeading}>Couple Goals & Remaining Amount</Text>
          <Text style={styles.cardSub}>
            Live analysis of target progress and exact amount needed more to achieve each goal.
          </Text>

          <View style={styles.goalsContainer}>
            {goals.map((g) => {
              const current = Number(g.current_amount) || 0;
              const target = Number(g.target_amount) || 1;
              const neededMore = Math.max(0, target - current);
              const progressPct = Math.min(100, Math.round((current / target) * 100));

              return (
                <View key={g.id} style={[styles.goalItemCard, { borderColor: g.color + '40' }]}>
                  <View style={styles.goalTopRow}>
                    <View style={styles.goalIconTitle}>
                      <View style={[styles.goalIconCircle, { backgroundColor: g.color + '25' }]}>
                        <Ionicons name={(g.icon as any) || 'trophy'} size={18} color={g.color} />
                      </View>
                      <View>
                        <Text style={styles.goalTitle}>{g.title}</Text>
                        <Text style={styles.goalSubtitle}>
                          Target: {formatCurrency(target, currency)} • Due {g.target_date || 'Ongoing'}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.pctBadge, { backgroundColor: g.color + '20' }]}>
                      <Text style={[styles.pctText, { color: g.color }]}>{progressPct}%</Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.goalProgressBarBg}>
                    <View
                      style={[
                        styles.goalProgressBarFill,
                        { width: `${progressPct}%`, backgroundColor: g.color },
                      ]}
                    />
                  </View>

                  {/* Needed More Highlight Banner */}
                  <View style={styles.neededMoreBanner}>
                    <View>
                      <Text style={styles.neededLabel}>Amount Needed More</Text>
                      <Text style={styles.neededAmount}>{formatCurrency(neededMore, currency)}</Text>
                    </View>

                    {onOpenContributeModal && (
                      <Pressable
                        style={[styles.contributeBtn, { backgroundColor: g.color }]}
                        onPress={() => onOpenContributeModal(g)}
                      >
                        <Ionicons name="add" size={14} color="#FFF" />
                        <Text style={styles.contributeBtnText}>Contribute</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* 4. STOCK MARKET INVESTMENT CAPITAL SPLIT */}
      {activeChartTab === 'stocks' && (
        <View style={styles.chartCard}>
          <Text style={styles.cardHeading}>Stock Market & Capital Split</Text>
          <Text style={styles.cardSub}>
            Individual and together invested capital across stocks, ETFs, SIPs & Mutual Funds.
          </Text>

          {/* Portfolio Total & Returns Summary */}
          <View style={styles.stockSummaryRow}>
            <View style={styles.stockSummaryBox}>
              <Text style={styles.stockBoxLabel}>Total Invested</Text>
              <Text style={styles.stockBoxVal}>{formatCurrency(totalStockInvested, currency)}</Text>
            </View>

            <View style={styles.stockSummaryBox}>
              <Text style={styles.stockBoxLabel}>Est. Current Value</Text>
              <Text style={[styles.stockBoxVal, { color: THEME.colors.primaryLight }]}>
                {formatCurrency(totalStockCurrentValue, currency)}
              </Text>
            </View>

            <View style={styles.stockSummaryBox}>
              <Text style={styles.stockBoxLabel}>Overall Gain</Text>
              <Text style={[styles.stockBoxVal, { color: THEME.colors.success }]}>
                +{formatCurrency(totalStockGain, currency)}
              </Text>
            </View>
          </View>

          {/* Capital Split by Investor */}
          {isCouple && totalStockInvested > 0 && (
            <View style={styles.stockInvestorBox}>
              <Text style={styles.catHeading}>Invested Capital Breakdown</Text>
              <View style={styles.investorRow}>
                {/* User A */}
                <View style={styles.investorCard}>
                  <View style={styles.investorHeader}>
                    <View style={[styles.colorDot, { backgroundColor: THEME.colors.partnerA }]} />
                    <Text style={styles.investorName}>{profile.display_name || 'You'}</Text>
                  </View>
                  <Text style={styles.investorCapital}>{formatCurrency(userStockInvested, currency)}</Text>
                  <Text style={styles.investorPct}>
                    {Math.round((userStockInvested / totalStockInvested) * 100)}% of total portfolio
                  </Text>
                </View>

                {/* User B */}
                <View style={styles.investorCard}>
                  <View style={styles.investorHeader}>
                    <View style={[styles.colorDot, { backgroundColor: THEME.colors.partnerB }]} />
                    <Text style={styles.investorName}>{partnerName}</Text>
                  </View>
                  <Text style={styles.investorCapital}>{formatCurrency(partnerStockInvested, currency)}</Text>
                  <Text style={styles.investorPct}>
                    {Math.round((partnerStockInvested / totalStockInvested) * 100)}% of total portfolio
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Holdings List */}
          <Text style={[styles.catHeading, { marginTop: 14 }]}>Holdings & Monthly Investments</Text>
          <View style={styles.holdingsList}>
            {investments.map((inv) => (
              <View key={inv.id} style={styles.holdingItem}>
                <View style={styles.holdingLeft}>
                  <View style={styles.holdingIconWrap}>
                    <Ionicons name="trending-up" size={16} color={THEME.colors.primaryLight} />
                  </View>
                  <View>
                    <Text style={styles.holdingTitle}>{inv.asset_name}</Text>
                    <Text style={styles.holdingSub}>
                      {inv.ticker ? `${inv.ticker} • ` : ''}{inv.asset_type.toUpperCase()} • Added by {inv.user_name || 'You'}
                    </Text>
                  </View>
                </View>
                <View style={styles.holdingRight}>
                  <Text style={styles.holdingAmount}>{formatCurrency(inv.invested_amount, currency)}</Text>
                  <Text style={styles.holdingDate}>{inv.purchase_date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeframeToggle: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceLight,
    borderRadius: 12,
    padding: 3,
  },
  timeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
  },
  activeTimeBtn: {
    backgroundColor: THEME.colors.primary,
  },
  timeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  activeTimeBtnText: {
    color: '#FFF',
  },
  chartTabScroll: {
    marginBottom: 14,
  },
  chartTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  activeChartTab: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chartTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  activeChartTabText: {
    color: '#FFF',
  },
  chartCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  cardHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  cardSub: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
    marginBottom: 14,
  },
  togetherBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: 16,
  },
  togetherLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.success,
    textTransform: 'uppercase',
  },
  togetherAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.colors.text,
    marginTop: 2,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.accentGold,
  },
  barComparisonBox: {
    gap: 12,
  },
  barItem: {
    gap: 6,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  barValue: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  barTrack: {
    height: 10,
    backgroundColor: THEME.colors.surfaceLight,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  partnerSplitBox: {
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  splitValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  partnerSplitName: {
    fontSize: 12,
    fontWeight: '700',
  },
  partnerSplitVal: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.text,
    marginTop: 2,
  },
  splitBarLarge: {
    height: 12,
    backgroundColor: THEME.colors.surfaceLight,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  splitPartA: {
    backgroundColor: THEME.colors.partnerA,
    height: '100%',
  },
  splitPartB: {
    backgroundColor: THEME.colors.partnerB,
    height: '100%',
  },
  catHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  catBreakdownList: {
    gap: 10,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 90,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catName: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  catBarWrapper: {
    flex: 1,
  },
  catBarBg: {
    height: 8,
    backgroundColor: THEME.colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  catRight: {
    alignItems: 'flex-end',
    width: 80,
  },
  catAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  catPct: {
    fontSize: 10,
    color: THEME.colors.textDim,
  },
  goalsContainer: {
    gap: 12,
  },
  goalItemCard: {
    backgroundColor: THEME.colors.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  goalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  goalIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  goalSubtitle: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  pctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pctText: {
    fontSize: 12,
    fontWeight: '800',
  },
  goalProgressBarBg: {
    height: 8,
    backgroundColor: THEME.colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  goalProgressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  neededMoreBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    padding: 10,
    borderRadius: 12,
  },
  neededLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textDim,
    textTransform: 'uppercase',
  },
  neededAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.colors.accentGold,
  },
  contributeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  contributeBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  stockSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  stockSummaryBox: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  stockBoxLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.colors.textDim,
    textTransform: 'uppercase',
  },
  stockBoxVal: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.text,
    marginTop: 2,
  },
  stockInvestorBox: {
    marginBottom: 14,
  },
  investorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  investorCard: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  investorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  investorName: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  investorCapital: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.text,
  },
  investorPct: {
    fontSize: 10,
    color: THEME.colors.textDim,
    marginTop: 2,
  },
  holdingsList: {
    gap: 8,
  },
  holdingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 10,
    borderRadius: 12,
  },
  holdingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  holdingIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  holdingSub: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  holdingRight: {
    alignItems: 'flex-end',
  },
  holdingAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  holdingDate: {
    fontSize: 10,
    color: THEME.colors.textDim,
  },
});
