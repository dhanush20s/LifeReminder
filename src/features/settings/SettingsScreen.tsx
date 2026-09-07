import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, TextInput, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setAppLockEnabled, setNotificationsEnabled, setWeatherEnabled } from '../../store/slices/settingsSlice';
import { backupService } from '../../services/backupService';
import { colors, spacing, radii, typography } from '../../theme';
import { AppHeader } from '../../components/AppHeader';
import { HardDrive, Info, CloudSun, ShieldCheck, Bell } from 'lucide-react-native';

export const SettingsScreen = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { appLockEnabled, notificationsEnabled, weatherEnabled } = useAppSelector((state) => state.settings);

  const handleExportBackup = async () => {
    await backupService.exportBackup();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Settings" onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Section 1: Weather Preferences */}
        <Text style={styles.sectionHeader}>PREFERENCES</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowTextCol}>
              <View style={styles.titleRow}>
                <CloudSun size={18} color="#4F46E5" style={{ marginRight: 6 }} />
                <Text style={styles.rowTitle}>Enable Weather</Text>
              </View>
              <Text style={styles.rowSub}>
                {weatherEnabled 
                  ? 'Location: Current Location · Refresh: Automatic' 
                  : 'Weather is turned off. Offline-first mode.'}
              </Text>
            </View>
            <Switch
              value={weatherEnabled}
              onValueChange={(val) => dispatch(setWeatherEnabled(val))}
              trackColor={{ false: '#CBD5E1', true: '#4F46E5' }}
            />
          </View>
        </View>

        {/* Section 2: Privacy & Security */}
        <Text style={styles.sectionHeader}>PRIVACY & SECURITY</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowTextCol}>
              <View style={styles.titleRow}>
                <ShieldCheck size={18} color="#4F46E5" style={{ marginRight: 6 }} />
                <Text style={styles.rowTitle}>App Lock (Biometrics/Passcode)</Text>
              </View>
              <Text style={styles.rowSub}>Protect local items, expenses & notes</Text>
            </View>
            <Switch
              value={appLockEnabled}
              onValueChange={(val) => dispatch(setAppLockEnabled(val))}
              trackColor={{ false: '#CBD5E1', true: '#4F46E5' }}
            />
          </View>
        </View>

        {/* Section 3: Notifications */}
        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowTextCol}>
              <View style={styles.titleRow}>
                <Bell size={18} color="#4F46E5" style={{ marginRight: 6 }} />
                <Text style={styles.rowTitle}>Enable Reminders & Alarms</Text>
              </View>
              <Text style={styles.rowSub}>Local device notification alerts</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(val) => dispatch(setNotificationsEnabled(val))}
              trackColor={{ false: '#CBD5E1', true: '#4F46E5' }}
            />
          </View>
        </View>

        {/* Section 4: Backup & Restore */}
        <Text style={styles.sectionHeader}>BACKUP & RESTORE</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleExportBackup}>
            <HardDrive size={20} color="#4F46E5" />
            <Text style={styles.actionText}>Export Local Backup (.lrb)</Text>
          </TouchableOpacity>
        </View>

        {/* About Box */}
        <View style={styles.aboutBox}>
          <Info size={18} color="#64748B" />
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
    backgroundColor: '#F6F7FE',
  },
  container: {
    padding: spacing.default,
    paddingBottom: 110,
  },
  sectionHeader: {
    ...typography.caption,
    color: '#64748B',
    fontWeight: '700',
    marginTop: spacing.default,
    marginBottom: spacing.compact,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.default,
    marginBottom: spacing.compact,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowTextCol: {
    flex: 1,
    paddingRight: spacing.small,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitle: {
    ...typography.body,
    fontWeight: '600',
    color: '#0F172A',
  },
  rowSub: {
    ...typography.caption,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.micro,
  },
  actionText: {
    ...typography.body,
    fontWeight: '600',
    color: '#4F46E5',
    marginLeft: spacing.compact,
  },
  aboutBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.card,
    padding: spacing.default,
    marginTop: spacing.section,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aboutText: {
    ...typography.caption,
    color: '#64748B',
    marginLeft: spacing.small,
    flex: 1,
  },
});
