import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRESET_AVATARS, THEME } from '../lib/constants';
import { supabase } from '../lib/supabase';
import { CurrencyCode, UserProfile } from '../lib/types';

interface AuthScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
  onContinueAsGuest: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const finalAvatar = customAvatarUrl.trim() || selectedAvatar;

  const handleSubmit = async () => {
    setMessage('');
    if (!email.trim() || !password.trim()) {
      setMessage('Please enter your email and password');
      return;
    }

    setLoading(true);

    if (supabase) {
      try {
        if (mode === 'signup') {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
              data: {
                display_name: displayName.trim() || 'Nu',
                avatar_url: finalAvatar,
                preferred_currency: currency,
                partner_email: partnerEmail.trim(),
              },
            },
          });

          if (error) {
            setMessage(error.message);
          } else if (data.user) {
            setMessage('Account created! Logging in...');
            onLoginSuccess({
              id: data.user.id,
              email: data.user.email || email,
              display_name: displayName.trim() || 'Nu',
              avatar_url: finalAvatar,
              preferred_currency: currency,
              partner_email: partnerEmail.trim(),
            });
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          });

          if (error) {
            setMessage(error.message);
          } else if (data.user) {
            onLoginSuccess({
              id: data.user.id,
              email: data.user.email || email,
              display_name: data.user.user_metadata?.display_name || 'Nu',
              avatar_url: data.user.user_metadata?.avatar_url || selectedAvatar,
              preferred_currency: data.user.user_metadata?.preferred_currency || 'INR',
              partner_email: data.user.user_metadata?.partner_email,
            });
          }
        }
      } catch (err: any) {
        setMessage(err.message || 'Authentication error');
      }
    } else {
      // Local/Offline Mode Direct Login
      setTimeout(() => {
        onLoginSuccess({
          id: `usr-${Date.now()}`,
          email: email.trim(),
          display_name: displayName.trim() || (mode === 'signup' ? 'Nu' : 'User'),
          avatar_url: finalAvatar,
          preferred_currency: currency,
          partner_email: partnerEmail.trim(),
        });
      }, 500);
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* App Logo & Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <Ionicons name="heart" size={28} color="#EC4899" />
            <Ionicons name="sparkles" size={18} color="#F59E0B" style={styles.sparkleIcon} />
          </View>
          <Text style={styles.appTitle}>NuPra Finance</Text>
          <Text style={styles.appSubtitle}>
            Smart, simple, and transparent finances for you and your partner.
          </Text>
        </View>

        {/* Mode Selector Tabs */}
        <View style={styles.modeTabs}>
          <Pressable
            style={[styles.modeTab, mode === 'signup' && styles.activeModeTab]}
            onPress={() => setMode('signup')}
          >
            <Text style={[styles.modeTabText, mode === 'signup' && styles.activeModeTabText]}>
              Create Couple Account
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeTab, mode === 'login' && styles.activeModeTab]}
            onPress={() => setMode('login')}
          >
            <Text style={[styles.modeTabText, mode === 'login' && styles.activeModeTabText]}>
              Log In
            </Text>
          </Pressable>
        </View>

        {message ? <Text style={styles.messageBanner}>{message}</Text> : null}

        {/* Sign up details: Photo / Avatar */}
        {mode === 'signup' && (
          <View style={styles.avatarPickerSection}>
            <Text style={styles.inputLabel}>Choose Your Photo / Avatar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarScroll}>
              {PRESET_AVATARS.map((av) => (
                <Pressable
                  key={av.id}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === av.url && styles.selectedAvatarOption,
                  ]}
                  onPress={() => {
                    setSelectedAvatar(av.url);
                    setCustomAvatarUrl('');
                  }}
                >
                  <Image source={{ uri: av.url }} style={styles.avatarImg} />
                  <Text style={styles.avatarLabelText}>{av.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <TextInput
              style={styles.textInput}
              placeholder="Or paste custom photo URL..."
              placeholderTextColor={THEME.colors.textDim}
              value={customAvatarUrl}
              onChangeText={setCustomAvatarUrl}
            />

            <Text style={styles.inputLabel}>Your First Name / Nickname</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Nu / Alex"
              placeholderTextColor={THEME.colors.textDim}
              value={displayName}
              onChangeText={setDisplayName}
            />

            <Text style={styles.inputLabel}>Preferred Currency</Text>
            <View style={styles.currencyRow}>
              <Pressable
                style={[styles.currencyBtn, currency === 'INR' && styles.activeCurrencyBtn]}
                onPress={() => setCurrency('INR')}
              >
                <Text style={styles.currencySymbol}>₹</Text>
                <Text style={[styles.currencyLabel, currency === 'INR' && { color: '#FFF' }]}>Rupees (INR)</Text>
              </Pressable>
              <Pressable
                style={[styles.currencyBtn, currency === 'EUR' && styles.activeCurrencyBtn]}
                onPress={() => setCurrency('EUR')}
              >
                <Text style={styles.currencySymbol}>€</Text>
                <Text style={[styles.currencyLabel, currency === 'EUR' && { color: '#FFF' }]}>Euros (EUR)</Text>
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Partner's Email (Optional link)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="partner@example.com"
              placeholderTextColor={THEME.colors.textDim}
              keyboardType="email-address"
              autoCapitalize="none"
              value={partnerEmail}
              onChangeText={setPartnerEmail}
            />
          </View>
        )}

        {/* Email & Password */}
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.textInput}
          placeholder="nu@nuprafinance.app"
          placeholderTextColor={THEME.colors.textDim}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.textInput}
          placeholder="••••••••"
          placeholderTextColor={THEME.colors.textDim}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Submit Button */}
        <Pressable style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name={mode === 'signup' ? 'heart' : 'log-in'} size={18} color="#FFF" />
              <Text style={styles.submitBtnText}>
                {mode === 'signup' ? 'Create NuPra Account' : 'Log In to NuPra'}
              </Text>
            </>
          )}
        </Pressable>

        {/* Demo / Guest Mode Fast Access */}
        <View style={styles.demoSection}>
          <Text style={styles.demoOrText}>— OR EXPLORE INSTANTLY —</Text>
          <Pressable style={styles.guestBtn} onPress={onContinueAsGuest}>
            <Ionicons name="sparkles" size={16} color={THEME.colors.accentGold} />
            <Text style={styles.guestBtnText}>Explore Live Demo (Nu & Pra Shared Space)</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  scroll: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.surface,
    borderWidth: 2,
    borderColor: 'rgba(236, 72, 153, 0.4)',
    marginBottom: 12,
    position: 'relative',
  },
  sparkleIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: THEME.colors.text,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeModeTab: {
    backgroundColor: THEME.colors.primary,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  activeModeTabText: {
    color: '#FFF',
  },
  messageBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#F87171',
    padding: 10,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 14,
  },
  avatarPickerSection: {
    marginBottom: 8,
  },
  avatarScroll: {
    marginBottom: 10,
  },
  avatarOption: {
    alignItems: 'center',
    marginRight: 10,
    padding: 3,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatarOption: {
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  avatarImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  avatarLabelText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: '700',
    marginTop: 3,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: THEME.colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    marginBottom: 8,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  currencyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  activeCurrencyBtn: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME.colors.accentGold,
  },
  currencyLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 18,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  demoSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  demoOrText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textDim,
    letterSpacing: 1,
    marginBottom: 12,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    width: '100%',
    justifyContent: 'center',
  },
  guestBtnText: {
    color: THEME.colors.accentGold,
    fontSize: 13,
    fontWeight: '800',
  },
});
