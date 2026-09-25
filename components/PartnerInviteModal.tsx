import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../lib/constants';
import { Workspace } from '../lib/types';

interface PartnerInviteModalProps {
  visible: boolean;
  onClose: () => void;
  workspace: Workspace;
  onInviteSent?: (email: string) => void;
}

export const PartnerInviteModal: React.FC<PartnerInviteModalProps> = ({
  visible,
  onClose,
  workspace,
  onInviteSent,
}) => {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [sentMessage, setSentMessage] = useState('');

  const inviteCode = workspace.invite_code || 'NUPRA2026';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on NuPra Finance to manage our couple finances together! Use Invite Code: ${inviteCode}\nDownload NuPra Finance.apk`,
        title: 'Join NuPra Couple Finance',
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  const handleSendEmail = () => {
    if (!email.trim()) return;
    if (onInviteSent) onInviteSent(email);
    setSentMessage(`Invite sent to ${email}! They can now join your workspace live.`);
    setEmail('');
    setTimeout(() => {
      setSentMessage('');
      onClose();
    }, 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleWrap}>
              <Ionicons name="heart" size={22} color={THEME.colors.secondary} />
              <Text style={styles.modalTitle}>Invite Partner 💍</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={THEME.colors.textMuted} />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Manage shared expenses, savings goals, bills, and stock investments together with live real-time sync.
          </Text>

          {/* Invite Code Card */}
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Couple Space Invite Code</Text>
            <Text style={styles.codeValue}>{inviteCode}</Text>
            <Pressable style={styles.shareBtn} onPress={handleShare}>
              <Ionicons name="share-social" size={16} color="#FFF" />
              <Text style={styles.shareBtnText}>Share Invite Code</Text>
            </Pressable>
          </View>

          {/* Or Email Invite */}
          <Text style={styles.orText}>— OR INVITE VIA EMAIL —</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="partner@example.com"
              placeholderTextColor={THEME.colors.textDim}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <Pressable style={styles.sendBtn} onPress={handleSendEmail}>
              <Ionicons name="paper-plane" size={16} color="#FFF" />
              <Text style={styles.sendBtnText}>Send</Text>
            </Pressable>
          </View>

          {sentMessage ? <Text style={styles.successMessage}>{sentMessage}</Text> : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  subtitle: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  codeCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textDim,
    textTransform: 'uppercase',
  },
  codeValue: {
    fontSize: 26,
    fontWeight: '900',
    color: THEME.colors.secondaryLight,
    letterSpacing: 3,
    marginVertical: 8,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  shareBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  orText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textDim,
    textAlign: 'center',
    marginVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: THEME.colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: THEME.colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  sendBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  successMessage: {
    marginTop: 12,
    fontSize: 12,
    color: THEME.colors.success,
    fontWeight: '700',
    textAlign: 'center',
  },
});
