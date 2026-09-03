import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, TextInput, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setAppLockEnabled, setNotificationsEnabled } from '../../store/slices/settingsSlice';
import { backupService } from '../../services/backupService';
import { setOpenWeatherApiKey } from '../home/services/weatherService';
import { colors, spacing, radii, typography } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { HardDrive, Info, CloudSun, Key } from 'lucide-react-native';

export const SettingsScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { appLockEnabled, notificationsEnabled } = useAppSelector((state) => state.settings);

  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleSaveApiKey = () => {
    setOpenWeatherApiKey(apiKeyInput.trim());
    Alert.alert('Weather Key Saved', 'OpenWeatherMap API Key updated successfully!');
  };

  const handleExportBackup = async () => {
    await backupService.exportBackup();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Settings" onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionHeader}>DYNAMIC WEATHER WIDGET</Text>
        <View style={styles.card}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>OpenWeatherMap API Key</Text>
            <Text style={styles.rowSub}>Defaulting to Open-Meteo free API (No key required)</Text>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.keyInput}
              placeholder="Paste OpenWeather API key..."
              placeholderTextColor={colors.textMuted}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.saveKeyBtn} onPress={handleSaveApiKey}>
              <Text style={styles.saveKeyText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionHeader}>PRIVACY & SECURITY</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>App Lock (Biometrics/Passcode)</Text>
              <Text style={styles.rowSub}>Protect local expenses & notes</Text>
            </View>
            <Switch
              value={appLockEnabled}
              onValueChange={(val) => dispatch(setAppLockEnabled(val))}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Enable Reminders & Alarms</Text>
              <Text style={styles.rowSub}>Local device alerts</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(val) => dispatch(setNotificationsEnabled(val))}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        <Text style={styles.sectionHeader}>BACKUP & RESTORE</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleExportBackup}>
            <HardDrive size={20} color={colors.primary} />
            <Text style={styles.actionText}>Export Local Backup (.lrb)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aboutBox}>
          <Info size={18} color={colors.textMuted} />
          <Text style={styles.aboutText}>
            Life Reminder v1.0.0 — 100% Local-First. Your data stays securely on your device.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.default,
    paddingBottom: 110,
  },
  sectionHeader: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    marginTop: spacing.default,
    marginBottom: spacing.small,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.default,
    marginBottom: spacing.compact,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowText: {
    marginBottom: spacing.small,
  },
  rowTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rowSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.small,
  },
  keyInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radii.field,
    paddingHorizontal: spacing.compact,
    paddingVertical: spacing.micro,
    ...typography.caption,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.small,
  },
  saveKeyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    borderRadius: radii.field,
  },
  saveKeyText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.micro,
  },
  actionText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.compact,
  },
  aboutBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.default,
    marginTop: spacing.section,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  aboutText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.small,
    flex: 1,
  },
});
