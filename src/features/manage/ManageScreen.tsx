import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';
import { 
  Bell, 
  CreditCard, 
  DollarSign, 
  CheckSquare, 
  Hourglass, 
  Handshake, 
  Settings, 
  ChevronRight
} from 'lucide-react-native';

export const ManageScreen = ({ navigation }: any) => {
  const sections = [
    {
      groupTitle: 'PLAN & REMIND',
      items: [
        { label: 'Reminders', icon: Bell, route: 'HomeTab' },
        { label: 'Checklists & Alarms', icon: CheckSquare, route: 'Checklists' },
      ],
    },
    {
      groupTitle: 'MONEY & BILLS',
      items: [
        { label: 'Expenses & Analytics', icon: DollarSign, route: 'Expenses' },
        { label: 'Bills & Subscriptions', icon: CreditCard, route: 'Bills' },
      ],
    },
    {
      groupTitle: 'LIFE MANAGEMENT',
      items: [
        { label: 'Expiry & Document Tracker', icon: Hourglass, route: 'Expiry' },
        { label: 'Borrow & Return', icon: Handshake, route: 'BorrowReturn' },
      ],
    },
    {
      groupTitle: 'SYSTEM',
      items: [
        { label: 'Backup & Security Settings', icon: Settings, route: 'Settings' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {sections.map((section) => (
          <View key={section.groupTitle} style={styles.sectionGroup}>
            <Text style={styles.groupTitle}>{section.groupTitle}</Text>
            <View style={styles.card}>
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                const isLast = idx === section.items.length - 1;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.row, !isLast && styles.rowBorder]}
                    onPress={() => navigation.navigate(item.route)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.rowLeft}>
                      <View style={styles.iconBox}>
                        <Icon size={20} color={colors.primary} />
                      </View>
                      <Text style={styles.rowLabel}>{item.label}</Text>
                    </View>
                    <ChevronRight size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.default,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 12) + 8 : spacing.default,
    paddingBottom: spacing.default,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  container: {
    paddingHorizontal: spacing.default,
    paddingBottom: 110,
  },
  sectionGroup: {
    marginBottom: spacing.section,
  },
  groupTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: spacing.small,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.default,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: radii.field,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.default,
  },
  rowLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
