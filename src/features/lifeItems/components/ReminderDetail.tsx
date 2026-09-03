import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LifeItem, Reminder } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { formatLifeItemDateTime, getRelativeDueText } from '../utils/lifeItemHelpers';
import { Calendar, Bell, Repeat, FileText } from 'lucide-react-native';

interface ReminderDetailProps {
  item: LifeItem;
  detailData?: Reminder | null;
}

export const ReminderDetail: React.FC<ReminderDetailProps> = ({ item, detailData }) => {
  return (
    <View style={styles.card}>
      <View style={styles.infoRow}>
        <View style={styles.iconBox}>
          <Calendar size={18} color={colors.primary} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.label}>Scheduled Date & Time</Text>
          <Text style={styles.value}>{formatLifeItemDateTime(item.startAt)}</Text>
          {item.startAt && (
            <Text style={styles.subValue}>{getRelativeDueText(item.startAt)}</Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.iconBox}>
          <Bell size={18} color={colors.primary} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.label}>Notification Status</Text>
          <Text style={styles.value}>
            {detailData?.isEnabled !== false ? 'Scheduled (Local Device Alert)' : 'Disabled'}
          </Text>
        </View>
      </View>

      {item.description && (
        <>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <FileText size={18} color={colors.primary} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.value}>{item.description}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.default,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.default,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.field,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.default,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  value: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subValue: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.default,
  },
});
