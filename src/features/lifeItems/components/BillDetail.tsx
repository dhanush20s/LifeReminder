import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LifeItem, Bill } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { exportService } from '../../../services/exportService';
import { formatLifeItemDate, getRelativeDueText } from '../utils/lifeItemHelpers';
import { CreditCard, Calendar, Repeat, FileText, CheckCircle2 } from 'lucide-react-native';

interface BillDetailProps {
  item: LifeItem;
  detailData?: Bill | null;
}

export const BillDetail: React.FC<BillDetailProps> = ({ item, detailData }) => {
  const amountMinor = detailData?.amountMinor || 0;
  const isPaid = item.status === 'completed';

  return (
    <View style={styles.card}>
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Bill Amount</Text>
        <Text style={styles.amountValue}>{exportService.formatAmount(amountMinor)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.iconBox}>
          <Calendar size={18} color={colors.warning} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.label}>Due Date</Text>
          <Text style={styles.value}>{formatLifeItemDate(detailData?.dueDate || item.startAt)}</Text>
          {item.startAt && (
            <Text style={[styles.subValue, item.status === 'overdue' && { color: colors.danger }]}>
              {getRelativeDueText(detailData?.dueDate || item.startAt)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.iconBox}>
          <CreditCard size={18} color={colors.warning} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.label}>Payment Status</Text>
          <Text style={[styles.value, isPaid && { color: colors.success }]}>
            {isPaid ? 'Paid' : 'Unpaid'}
          </Text>
        </View>
      </View>

      {item.description && (
        <>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <FileText size={18} color={colors.warning} />
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
  amountContainer: {
    alignItems: 'center',
    paddingVertical: spacing.small,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  amountValue: {
    ...typography.display,
    fontSize: 32,
    color: colors.textPrimary,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.field,
    backgroundColor: colors.warningLight,
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
    color: colors.warning,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.default,
  },
});
