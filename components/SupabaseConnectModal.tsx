import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../lib/constants';
import { SUPABASE_KEYS, initSupabaseClient } from '../lib/supabase';

interface SupabaseConnectModalProps {
  visible: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export const SupabaseConnectModal: React.FC<SupabaseConnectModalProps> = ({
  visible,
  onClose,
  onConnected,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(SUPABASE_KEYS.URL).then((u) => {
      if (u) setUrl(u);
    });
    AsyncStorage.getItem(SUPABASE_KEYS.KEY).then((k) => {
      if (k) setAnonKey(k);
    });
  }, [visible]);

  const handleConnect = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setStatusMessage({ text: 'Please enter both your Supabase URL and Anon Key', success: false });
      return;
    }

    if (!url.startsWith('https://')) {
      setStatusMessage({ text: 'URL must start with https:// (e.g. https://xyz.supabase.co)', success: false });
      return;
    }

    setTesting(true);
    setStatusMessage(null);

    try {
      const client = await initSupabaseClient(url.trim(), anonKey.trim());
      // Test ping auth
      const { error } = await client.auth.getSession();

      if (error) {
        setStatusMessage({ text: `Connection issue: ${error.message}`, success: false });
      } else {
        setStatusMessage({ text: 'Connected to Supabase successfully! Live cloud sync active.', success: true });
        if (onConnected) onConnected();
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (e: any) {
      setStatusMessage({ text: e.message || 'Failed to connect to Supabase', success: false });
    } finally {
      setTesting(false);
    }
  };

  const handleOpenSupabase = () => {
    Linking.openURL('https://supabase.com/dashboard');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.cloudIconWrap}>
                <Ionicons name="cloud" size={20} color="#3ECF8E" />
              </View>
              <Text style={styles.modalTitle}>Connect Supabase Cloud ☁️</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={THEME.colors.textMuted} />
            </Pressable>
          </View>

          <Text style={styles.instructions}>
            Enter your project credentials to enable live real-time synchronization between you and your partner.
          </Text>

          {/* Helper button to open Supabase Dashboard */}
          <Pressable style={styles.helperBtn} onPress={handleOpenSupabase}>
            <Ionicons name="open-outline" size={14} color="#3ECF8E" />
            <Text style={styles.helperBtnText}>Open Supabase Dashboard (Settings → API)</Text>
          </Pressable>

          {/* URL Input */}
          <Text style={styles.inputLabel}>Supabase Project URL</Text>
          <TextInput
            style={styles.textInput}
            placeholder="https://your-project.supabase.co"
            placeholderTextColor={THEME.colors.textDim}
            autoCapitalize="none"
            value={url}
            onChangeText={setUrl}
          />

          {/* Anon Key Input */}
          <Text style={styles.inputLabel}>Supabase Anon / Publishable Key</Text>
          <TextInput
            style={styles.textInput}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            placeholderTextColor={THEME.colors.textDim}
            autoCapitalize="none"
            secureTextEntry
            value={anonKey}
            onChangeText={setAnonKey}
          />

          {statusMessage && (
            <View
              style={[
                styles.statusBanner,
                statusMessage.success ? styles.statusSuccess : styles.statusError,
              ]}
            >
              <Ionicons
                name={statusMessage.success ? 'checkmark-circle' : 'alert-circle'}
                size={16}
                color={statusMessage.success ? THEME.colors.success : THEME.colors.danger}
              />
              <Text
                style={[
                  styles.statusText,
                  statusMessage.success ? { color: THEME.colors.success } : { color: THEME.colors.danger },
                ]}
              >
                {statusMessage.text}
              </Text>
            </View>
          )}

          {/* Connect Button */}
          <Pressable style={styles.connectBtn} onPress={handleConnect} disabled={testing}>
            {testing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="flash" size={18} color="#FFF" />
                <Text style={styles.connectBtnText}>Save & Connect Cloud</Text>
              </>
            )}
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
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cloudIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(62, 207, 142, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
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
  instructions: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    lineHeight: 18,
    marginBottom: 14,
  },
  helperBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(62, 207, 142, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(62, 207, 142, 0.25)',
    marginBottom: 16,
  },
  helperBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3ECF8E',
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
    fontSize: 13,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    marginBottom: 8,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  statusSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3ECF8E',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 12,
  },
  connectBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '800',
  },
});
