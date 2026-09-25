import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRESET_AVATARS, THEME } from '../lib/constants';
import { CurrencyCode, UserProfile } from '../lib/types';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updated: Partial<UserProfile>) => void;
  onSignOut: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  profile,
  onSave,
  onSignOut,
}) => {
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [currency, setCurrency] = useState<CurrencyCode>(profile.preferred_currency || 'INR');
  const [partnerEmail, setPartnerEmail] = useState(profile.partner_email || '');
  const [showCustomUrl, setShowCustomUrl] = useState(false);

  const handleSave = () => {
    onSave({
      display_name: displayName.trim(),
      avatar_url: avatarUrl,
      preferred_currency: currency,
      partner_email: partnerEmail.trim(),
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Profile & Preferences 👤</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={THEME.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Current Avatar Preview */}
            <View style={styles.avatarCenter}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.previewAvatar} />
              ) : (
                <View style={[styles.previewAvatar, styles.placeholderAvatar]}>
                  <Text style={styles.placeholderText}>{displayName.charAt(0) || 'U'}</Text>
                </View>
              )}
              <Text style={styles.avatarLabel}>Choose Your Avatar / Photo</Text>
            </View>

            {/* Preset Avatars */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarScroll}>
              {PRESET_AVATARS.map((av) => (
                <Pressable
                  key={av.id}
                  style={[
                    styles.avatarOption,
                    avatarUrl === av.url && styles.selectedAvatarOption,
                  ]}
                  onPress={() => setAvatarUrl(av.url)}
                >
                  <Image source={{ uri: av.url }} style={styles.miniAvatar} />
                  <Text style={styles.avatarOptionName}>{av.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Custom Photo URL toggle */}
            <Pressable
              style={styles.customUrlToggle}
              onPress={() => setShowCustomUrl(!showCustomUrl)}
            >
              <Ionicons name="camera-outline" size={16} color={THEME.colors.primaryLight} />
              <Text style={styles.customUrlText}>
                {showCustomUrl ? 'Hide Custom Photo URL' : 'Use Custom Photo URL'}
              </Text>
            </Pressable>

            {showCustomUrl && (
              <TextInput
                style={styles.textInput}
                placeholder="https://example.com/my-photo.jpg"
                placeholderTextColor={THEME.colors.textDim}
                value={avatarUrl}
                onChangeText={setAvatarUrl}
              />
            )}

            {/* Display Name */}
            <Text style={styles.inputLabel}>Your Name / Nickname</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Nu"
              placeholderTextColor={THEME.colors.textDim}
              value={displayName}
              onChangeText={setDisplayName}
            />

            {/* Preferred Currency */}
            <Text style={styles.inputLabel}>Preferred Currency</Text>
            <View style={styles.currencyRow}>
              <Pressable
                style={[
                  styles.currencyChip,
                  currency === 'INR' && styles.selectedCurrencyChip,
                ]}
                onPress={() => setCurrency('INR')}
              >
                <Text style={styles.currencySymbol}>₹</Text>
                <Text style={[styles.currencyText, currency === 'INR' && { color: '#FFF' }]}>
                  Rupees (INR)
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.currencyChip,
                  currency === 'EUR' && styles.selectedCurrencyChip,
                ]}
                onPress={() => setCurrency('EUR')}
              >
                <Text style={styles.currencySymbol}>€</Text>
                <Text style={[styles.currencyText, currency === 'EUR' && { color: '#FFF' }]}>
                  Euros (EUR)
                </Text>
              </Pressable>
            </View>

            {/* Partner Email Link */}
            <Text style={styles.inputLabel}>Partner's Email</Text>
            <TextInput
              style={styles.textInput}
              placeholder="partner@nuprafinance.app"
              placeholderTextColor={THEME.colors.textDim}
              value={partnerEmail}
              onChangeText={setPartnerEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Save Button */}
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="checkmark-circle" size={18} color="#FFF" />
              <Text style={styles.saveBtnText}>Save Preferences</Text>
            </Pressable>

            {/* Logout Button */}
            <Pressable style={styles.logoutBtn} onPress={onSignOut}>
              <Ionicons name="log-out-outline" size={18} color={THEME.colors.danger} />
              <Text style={styles.logoutBtnText}>Log Out Account</Text>
            </Pressable>
          </ScrollView>
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
  avatarCenter: {
    alignItems: 'center',
    marginBottom: 14,
  },
  previewAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: THEME.colors.primary,
  },
  placeholderAvatar: {
    backgroundColor: THEME.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
  },
  avatarLabel: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontWeight: '600',
    marginTop: 8,
  },
  avatarScroll: {
    marginBottom: 12,
  },
  avatarOption: {
    alignItems: 'center',
    marginRight: 12,
    padding: 4,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatarOption: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  miniAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarOptionName: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  customUrlToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  customUrlText: {
    fontSize: 12,
    color: THEME.colors.primaryLight,
    fontWeight: '700',
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
  currencyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  currencyChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  selectedCurrencyChip: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.accentGold,
  },
  currencyText: {
    fontSize: 13,
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
    marginTop: 14,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutBtnText: {
    color: THEME.colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
