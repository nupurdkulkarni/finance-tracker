import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, formatCurrency } from '../lib/constants';
import { CurrencyCode, Transaction, UserProfile, Workspace } from '../lib/types';

interface TransactionItemProps {
  transaction: Transaction;
  profile: UserProfile;
  workspace: Workspace;
  currency: CurrencyCode;
  onDelete?: (id: string) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  profile,
  workspace,
  currency,
  onDelete,
}) => {
  const isIncome = transaction.type === 'income';
  const isInvestment = transaction.type === 'investment';
  const isExpense = transaction.type === 'expense' || transaction.type === 'bill';
  const isCouple = workspace.type === 'couple';

  const isPaidByMe = transaction.paid_by === profile.id;
  const isSplit = transaction.paid_by_name?.toLowerCase().includes('split');

  const amountColor = isIncome
    ? THEME.colors.success
    : isInvestment
    ? THEME.colors.primaryLight
    : '#F87171';

  return (
    <View style={styles.container}>
      {/* Category Icon */}
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: (transaction.category_color || THEME.colors.primary) + '22',
            borderColor: transaction.category_color || THEME.colors.primary,
          },
        ]}
      >
        <Ionicons
          name={(transaction.category_icon as any) || (isIncome ? 'cash-outline' : 'pricetag-outline')}
          size={18}
          color={transaction.category_color || THEME.colors.primary}
        />
      </View>

      {/* Main Info */}
      <View style={styles.mainInfo}>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description}
        </Text>
        <View style={styles.subRow}>
          <Text style={styles.categoryName}>{transaction.category_name || 'General'}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.dateText}>{transaction.transaction_date}</Text>
          {transaction.payment_method_name ? (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.methodText}>{transaction.payment_method_name}</Text>
            </>
          ) : null}
        </View>
      </View>

      {/* Amount & Payer Badge */}
      <View style={styles.rightColumn}>
        <Text style={[styles.amountText, { color: amountColor }]}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
        </Text>

        {isCouple && (
          <View
            style={[
              styles.payerBadge,
              isSplit
                ? { backgroundColor: 'rgba(16, 185, 129, 0.15)' }
                : isPaidByMe
                ? { backgroundColor: 'rgba(99, 102, 241, 0.15)' }
                : { backgroundColor: 'rgba(236, 72, 153, 0.15)' },
            ]}
          >
            <Ionicons
              name={isSplit ? 'people' : isPaidByMe ? 'person' : 'heart'}
              size={10}
              color={isSplit ? THEME.colors.success : isPaidByMe ? THEME.colors.partnerA : THEME.colors.partnerB}
            />
            <Text
              style={[
                styles.payerBadgeText,
                {
                  color: isSplit
                    ? THEME.colors.success
                    : isPaidByMe
                    ? THEME.colors.partnerA
                    : THEME.colors.partnerB,
                },
              ]}
            >
              {transaction.paid_by_name || (isPaidByMe ? 'You' : 'Partner')}
            </Text>
          </View>
        )}
      </View>

      {/* Optional Delete Button */}
      {onDelete && (
        <Pressable style={styles.deleteBtn} onPress={() => onDelete(transaction.id)}>
          <Ionicons name="trash-outline" size={14} color={THEME.colors.textDim} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 12,
  },
  mainInfo: {
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  dot: {
    fontSize: 10,
    color: THEME.colors.textDim,
  },
  dateText: {
    fontSize: 11,
    color: THEME.colors.textDim,
  },
  methodText: {
    fontSize: 11,
    color: THEME.colors.textDim,
  },
  rightColumn: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800',
  },
  payerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 3,
  },
  payerBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 6,
  },
});
