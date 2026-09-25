import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../lib/constants';
import { Workspace } from '../lib/types';

interface WorkspaceModalProps {
  visible: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  onSelectWorkspace: (ws: Workspace) => void;
  onCreateCoupleWorkspace: (name: string, partnerName: string) => void;
  onJoinWithCode: (code: string) => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  visible,
  onClose,
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onCreateCoupleWorkspace,
  onJoinWithCode,
}) => {
  const [tab, setTab] = useState<'switch' | 'new' | 'join'>('switch');
  const [coupleName, setCoupleName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleCreate = () => {
    if (!coupleName.trim()) {
      setFeedback('Please enter a space name');
      return;
    }
    onCreateCoupleWorkspace(coupleName.trim(), partnerName.trim() || 'Partner');
    setCoupleName('');
    setPartnerName('');
    setFeedback('Couple Workspace created!');
    setTimeout(() => {
      setFeedback('');
      onClose();
    }, 1200);
  };

  const handleJoin = () => {
    if (!inviteCode.trim()) {
      setFeedback('Please enter an invite code');
      return;
    }
    onJoinWithCode(inviteCode.trim());
    setInviteCode('');
    setFeedback('Joined Workspace successfully!');
    setTimeout(() => {
      setFeedback('');
      onClose();
    }, 1200);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Workspaces & Modes 🔄</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={THEME.colors.textMuted} />
            </Pressable>
          </View>

          {/* Sub Navigation */}
          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tabBtn, tab === 'switch' && styles.activeTabBtn]}
              onPress={() => setTab('switch')}
            >
              <Text style={[styles.tabBtnText, tab === 'switch' && styles.activeTabBtnText]}>
                My Spaces
              </Text>
            </Pressable>

            <Pressable
              style={[styles.tabBtn, tab === 'new' && styles.activeTabBtn]}
              onPress={() => setTab('new')}
            >
              <Text style={[styles.tabBtnText, tab === 'new' && styles.activeTabBtnText]}>
                + Create Couple
              </Text>
            </Pressable>

            <Pressable
              style={[styles.tabBtn, tab === 'join' && styles.activeTabBtn]}
              onPress={() => setTab('join')}
            >
              <Text style={[styles.tabBtnText, tab === 'join' && styles.activeTabBtnText]}>
                Join Code
              </Text>
            </Pressable>
          </View>

          {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}

          {/* Tab 1: Switch between workspaces */}
          {tab === 'switch' && (
            <View style={styles.workspaceList}>
              {workspaces.map((ws) => {
                const isSelected = ws.id === activeWorkspace.id;
                const isCouple = ws.type === 'couple';

                return (
                  <Pressable
                    key={ws.id}
                    style={[
                      styles.workspaceItem,
                      isSelected && styles.selectedWorkspaceItem,
                    ]}
                    onPress={() => {
                      onSelectWorkspace(ws);
                      onClose();
                    }}
                  >
                    <View
                      style={[
                        styles.wsIconWrap,
                        { backgroundColor: isCouple ? 'rgba(236, 72, 153, 0.2)' : 'rgba(99, 102, 241, 0.2)' },
                      ]}
                    >
                      <Ionicons
                        name={isCouple ? 'heart' : 'person'}
                        size={20}
                        color={isCouple ? THEME.colors.secondary : THEME.colors.primaryLight}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.wsNameText}>{ws.name}</Text>
                      <Text style={styles.wsTypeText}>
                        {isCouple ? `Couple Space (${ws.partner_name ? `with ${ws.partner_name}` : 'Shared'})` : 'Personal Private Space'}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={THEME.colors.success} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Tab 2: Create new couple space */}
          {tab === 'new' && (
            <View>
              <Text style={styles.inputLabel}>Space Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Nu & Pra Living Together 💍"
                placeholderTextColor={THEME.colors.textDim}
                value={coupleName}
                onChangeText={setCoupleName}
              />

              <Text style={styles.inputLabel}>Partner's First Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Pra"
                placeholderTextColor={THEME.colors.textDim}
                value={partnerName}
                onChangeText={setPartnerName}
              />

              <Pressable style={styles.actionSubmitBtn} onPress={handleCreate}>
                <Ionicons name="heart" size={18} color="#FFF" />
                <Text style={styles.actionSubmitText}>Create Couple Space</Text>
              </Pressable>
            </View>
          )}

          {/* Tab 3: Join with code */}
          {tab === 'join' && (
            <View>
              <Text style={styles.inputLabel}>Enter Partner's Invite Code</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. NUPRA2026"
                placeholderTextColor={THEME.colors.textDim}
                autoCapitalize="characters"
                value={inviteCode}
                onChangeText={setInviteCode}
              />

              <Pressable style={[styles.actionSubmitBtn, { backgroundColor: THEME.colors.secondary }]} onPress={handleJoin}>
                <Ionicons name="link" size={18} color="#FFF" />
                <Text style={styles.actionSubmitText}>Join Partner's Workspace</Text>
              </Pressable>
            </View>
          )}
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabBtn: {
    backgroundColor: THEME.colors.surfaceLight,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  activeTabBtnText: {
    color: THEME.colors.text,
  },
  feedbackText: {
    color: THEME.colors.success,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 10,
  },
  workspaceList: {
    gap: 10,
  },
  workspaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: THEME.colors.card,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  selectedWorkspaceItem: {
    borderColor: THEME.colors.primaryLight,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  wsIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wsNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  wsTypeText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
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
    marginBottom: 12,
  },
  actionSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 10,
  },
  actionSubmitText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
