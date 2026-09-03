import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, radii, typography } from '../../../theme';
import { exportService } from '../../../services/exportService';
import { TrendingUp, CreditCard, Inbox, CheckCircle2 } from 'lucide-react-native';

interface LifeAtGlanceSectionProps {
  monthlySpendingMinor: number;
  upcomingBillsCount: number;
  inboxCount: number;
  onExpensesPress: () => void;
  onBillsPress: () => void;
  onInboxPress: () => void;
}

export const LifeAtGlanceSection: React.FC<LifeAtGlanceSectionProps> = ({
  monthlySpendingMinor,
  upcomingBillsCount,
  inboxCount,
  onExpensesPress,
  onBillsPress,
  onInboxPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TrendingUp size={16} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={styles.sectionTitle}>Life at a glance</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Card 1: Spent this month */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#F5F3FF' }]}
          onPress={onExpensesPress}
          activeOpacity={0.8}
        >
          <View style={[styles.iconPill, { backgroundColor: '#EDE9FE' }]}>
            <TrendingUp size={16} color={colors.accentPurple} />
          </View>
          <Text style={styles.statValue}>
            {exportService.formatAmount(monthlySpendingMinor || 1240000)}
          </Text>
          <Text style={styles.statLabel}>Spent this month</Text>
          {/* Subtle Sparkline Bar Representation */}
          <View style={styles.sparkBarRow}>
            <View style={[styles.sparkBar, { height: 6, backgroundColor: '#DDD6FE' }]} />
            <View style={[styles.sparkBar, { height: 10, backgroundColor: '#C4B5FD' }]} />
            <View style={[styles.sparkBar, { height: 14, backgroundColor: colors.accentPurple }]} />
            <View style={[styles.sparkBar, { height: 8, backgroundColor: '#C4B5FD' }]} />
          </View>
        </TouchableOpacity>

        {/* Card 2: Bills upcoming */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#FFFBEB' }]}
          onPress={onBillsPress}
          activeOpacity={0.8}
        >
          <View style={[styles.iconPill, { backgroundColor: '#FEF3C7' }]}>
            <CreditCard size={16} color={colors.warning} />
          </View>
          <Text style={styles.statValue}>{upcomingBillsCount || 3}</Text>
          <Text style={styles.statLabel}>Bills upcoming</Text>
          <View style={styles.sparkBarRow}>
            <View style={[styles.sparkBar, { height: 12, backgroundColor: '#FDE68A' }]} />
            <View style={[styles.sparkBar, { height: 16, backgroundColor: colors.warning }]} />
            <View style={[styles.sparkBar, { height: 8, backgroundColor: '#FDE68A' }]} />
          </View>
        </TouchableOpacity>

        {/* Card 3: Inbox items */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#F0FDF4' }]}
          onPress={onInboxPress}
          activeOpacity={0.8}
        >
          <View style={[styles.iconPill, { backgroundColor: '#DCFCE7' }]}>
            <Inbox size={16} color={colors.success} />
          </View>
          <Text style={styles.statValue}>{inboxCount || 5}</Text>
          <Text style={styles.statLabel}>Inbox items</Text>
          <View style={styles.sparkBarRow}>
            <View style={[styles.sparkBar, { height: 8, backgroundColor: '#BBF7D0' }]} />
            <View style={[styles.sparkBar, { height: 14, backgroundColor: colors.success }]} />
            <View style={[styles.sparkBar, { height: 10, backgroundColor: '#BBF7D0' }]} />
          </View>
        </TouchableOpacity>

        {/* Card 4: Tasks completed */}
        <View style={[styles.card, { backgroundColor: '#EFF6FF' }]}>
          <View style={[styles.iconPill, { backgroundColor: '#DBEAFE' }]}>
            <CheckCircle2 size={16} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Tasks completed This week</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.default,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.compact,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 15,
    color: colors.textPrimary,
  },
  scrollContainer: {
    paddingRight: spacing.default,
  },
  card: {
    width: 125,
    borderRadius: radii.card,
    padding: spacing.compact,
    marginRight: spacing.compact,
    justifyContent: 'space-between',
    height: 125,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  iconPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    ...typography.heading,
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sparkBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  sparkBar: {
    width: 6,
    borderRadius: 3,
    marginRight: 3,
  },
});
