import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../lib/constants';
import { CurrencyCode, UserProfile, Workspace } from '../lib/types';

interface HeaderProps {
  profile: UserProfile;
  workspace: Workspace;
  onOpenProfile: () => void;
  onOpenWorkspaceModal: () => void;
  onToggleCurrency: (newCurrency: CurrencyCode) => void;
  onOpenPartnerInvite: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  workspace,
  onOpenProfile,
  onOpenWorkspaceModal,
  onToggleCurrency,
  onOpenPartnerInvite,
}) => {
  const isCouple = workspace.type === 'couple';
  const nextCurrency: CurrencyCode = profile.preferred_currency === 'INR' ? 'EUR' : 'INR';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Profile Avatar & Greeting */}
        <Pressable style={styles.profileSection} onPress={onOpenProfile}>
          <View style={styles.avatarContainer}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>{profile.display_name?.charAt(0) || 'U'}</Text>
              </View>
            )}
            <View style={styles.onlineBadge} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{profile.display_name || 'Nu'}</Text>
              {isCouple && (
                <View style={styles.couplePill}>
                  <Ionicons name="heart" size={12} color="#EC4899" />
                  <Text style={styles.couplePillText}>+ {workspace.partner_name || 'Pra'}</Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>

        {/* Action Controls */}
        <View style={styles.actionsRow}>
          {/* Currency Toggle (₹ / €) */}
          <Pressable
            style={styles.currencyButton}
            onPress={() => onToggleCurrency(nextCurrency)}
          >
            <Text style={styles.currencyButtonText}>
              {profile.preferred_currency === 'INR' ? '₹ INR' : '€ EUR'}
            </Text>
            <Ionicons name="swap-horizontal" size={14} color={THEME.colors.accentGold} />
          </Pressable>

          {/* Partner Invite / Link Button */}
          {isCouple ? (
            <Pressable style={styles.partnerBtn} onPress={onOpenPartnerInvite}>
              <Ionicons name="people" size={18} color="#EC4899" />
            </Pressable>
          ) : (
            <Pressable style={styles.invitePartnerBtn} onPress={onOpenPartnerInvite}>
              <Ionicons name="person-add" size={16} color="#FFF" />
              <Text style={styles.invitePartnerText}>Invite</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Workspace Switcher Bar */}
      <View style={styles.workspaceBar}>
        <Pressable style={styles.workspaceSelector} onPress={onOpenWorkspaceModal}>
          <View style={styles.workspaceIconWrap}>
            <Ionicons
              name={isCouple ? 'heart-circle' : 'person-circle'}
              size={18}
              color={isCouple ? '#EC4899' : '#6366F1'}
            />
          </View>
          <Text style={styles.workspaceName} numberOfLines={1}>
            {workspace.name}
          </Text>
          <Ionicons name="chevron-down" size={16} color={THEME.colors.textMuted} />
        </Pressable>

        <View style={styles.syncBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.syncText}>Live Cloud Sync</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: THEME.colors.bg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: THEME.colors.primaryLight,
  },
  avatarPlaceholder: {
    backgroundColor: THEME.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.colors.success,
    borderWidth: 2,
    borderColor: THEME.colors.bg,
  },
  textContainer: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 12,
    color: THEME.colors.textDim,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  couplePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  couplePillText: {
    fontSize: 11,
    color: '#F472B6',
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  currencyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.accentGold,
  },
  partnerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invitePartnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  invitePartnerText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  workspaceBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: THEME.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  workspaceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  workspaceIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: THEME.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workspaceName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.text,
    maxWidth: '75%',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.success,
  },
  syncText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.success,
  },
});
