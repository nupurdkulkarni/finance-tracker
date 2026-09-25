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
import { CurrencyCode, StockInvestment, UserProfile, Workspace } from '../lib/types';

interface StockModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (inv: Omit<StockInvestment, 'id'>) => void;
  profile: UserProfile;
  workspace: Workspace;
  currency: CurrencyCode;
}

export const StockModal: React.FC<StockModalProps> = ({
  visible,
  onClose,
  onSave,
  profile,
  workspace,
  currency,
}) => {
  const [assetName, setAssetName] = useState('');
  const [ticker, setTicker] = useState('');
  const [assetType, setAssetType] = useState<'stock' | 'sip' | 'etf' | 'mutual_fund' | 'crypto'>('stock');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [investorId, setInvestorId] = useState(profile.id);
  const [error, setError] = useState('');

  const isCouple = workspace.type === 'couple';
  const partnerName = workspace.partner_name || 'Partner';
  const partnerId = workspace.partner_id || 'partner-id';

  const handleSave = () => {
    if (!assetName.trim()) {
      setError('Please enter stock / fund name');
      return;
    }
    if (!investedAmount || isNaN(Number(investedAmount)) || Number(investedAmount) <= 0) {
      setError('Please enter valid invested capital amount');
      return;
    }

    const numInvested = Number(investedAmount);
    const numCurrent = currentValue && !isNaN(Number(currentValue)) ? Number(currentValue) : numInvested;

    const isMe = investorId === profile.id;

    onSave({
      workspace_id: workspace.id,
      user_id: investorId,
      user_name: isMe ? (profile.display_name || 'Me') : partnerName,
      user_avatar: isMe ? profile.avatar_url : workspace.partner_avatar,
      asset_name: assetName.trim(),
      ticker: ticker.trim().toUpperCase() || undefined,
      asset_type: assetType,
      invested_amount: numInvested,
      current_value: numCurrent,
      currency: currency,
      purchase_date: purchaseDate,
      notes: notes.trim(),
    });

    setAssetName('');
    setTicker('');
    setInvestedAmount('');
    setCurrentValue('');
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
              <Ionicons name="trending-up" size={22} color={THEME.colors.primaryLight} />
              <Text style={styles.modalTitle}>Stock & Investment</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={THEME.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Asset Type Selector */}
            <Text style={styles.inputLabel}>Asset Category</Text>
            <View style={styles.typeSelector}>
              {(['stock', 'sip', 'etf', 'mutual_fund', 'crypto'] as const).map((t) => {
                const isSelected = assetType === t;
                return (
                  <Pressable
                    key={t}
                    style={[styles.typeChip, isSelected && styles.selectedTypeChip]}
                    onPress={() => setAssetType(t)}
                  >
                    <Text style={[styles.typeChipText, isSelected && styles.selectedTypeChipText]}>
                      {t === 'sip' ? 'Monthly SIP' : t === 'mutual_fund' ? 'Mutual Fund' : t.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Asset Name & Ticker */}
            <View style={styles.row}>
              <View style={{ flex: 2 }}>
                <Text style={styles.inputLabel}>Asset / Company Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Apple, NIFTY 50, TCS, Bitcoin"
                  placeholderTextColor={THEME.colors.textDim}
                  value={assetName}
                  onChangeText={setAssetName}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>Ticker / Symbol</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="AAPL / TCS"
                  placeholderTextColor={THEME.colors.textDim}
                  autoCapitalize="characters"
                  value={ticker}
                  onChangeText={setTicker}
                />
              </View>
            </View>

            {/* Invested Capital & Current Value */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={styles.inputLabel}>Capital Invested ({currency === 'EUR' ? '€' : '₹'})</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="10000"
                  placeholderTextColor={THEME.colors.textDim}
                  keyboardType="numeric"
                  value={investedAmount}
                  onChangeText={setInvestedAmount}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={styles.inputLabel}>Current Est. Value</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="11500"
                  placeholderTextColor={THEME.colors.textDim}
                  keyboardType="numeric"
                  value={currentValue}
                  onChangeText={setCurrentValue}
                />
              </View>
            </View>

            {/* Contributor / Owner (Nu vs Pra) */}
            {isCouple && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.inputLabel}>Investor</Text>
                <View style={styles.ownerRow}>
                  <Pressable
                    style={[
                      styles.ownerChip,
                      investorId === profile.id && {
                        backgroundColor: THEME.colors.partnerA,
                        borderColor: THEME.colors.partnerA,
                      },
                    ]}
                    onPress={() => setInvestorId(profile.id)}
                  >
                    <Ionicons name="person" size={14} color="#FFF" />
                    <Text style={styles.ownerChipText}>{profile.display_name || 'Me'}</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.ownerChip,
                      investorId === partnerId && {
                        backgroundColor: THEME.colors.partnerB,
                        borderColor: THEME.colors.partnerB,
                      },
                    ]}
                    onPress={() => setInvestorId(partnerId)}
                  >
                    <Ionicons name="heart" size={14} color="#FFF" />
                    <Text style={styles.ownerChipText}>{partnerName}</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Purchase Date */}
            <Text style={styles.inputLabel}>Investment Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={purchaseDate}
              onChangeText={setPurchaseDate}
              placeholder="2026-09-25"
              placeholderTextColor={THEME.colors.textDim}
            />

            {/* Notes */}
            <Text style={styles.inputLabel}>Investment Strategy / Notes</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Monthly SIP for retirement compounding"
              placeholderTextColor={THEME.colors.textDim}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Save Investment */}
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="trending-up" size={18} color="#FFF" />
              <Text style={styles.saveBtnText}>Record Investment</Text>
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
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  selectedTypeChip: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  selectedTypeChipText: {
    color: '#FFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primary,
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
