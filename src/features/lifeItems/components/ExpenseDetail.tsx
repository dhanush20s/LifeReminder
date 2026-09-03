import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LifeItem, Expense } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { exportService } from '../../../services/exportService';
import { formatLifeItemDate } from '../utils/lifeItemHelpers';
import { DollarSign, Tag, Calendar, FileText } from 'lucide-react-native';

interface ExpenseDetailProps {
  item: LifeItem;
  detailData?: Expense | null;
}

export const ExpenseDetail: React.FC<ExpenseDetailProps> = ({ item, detailData }) => {
  const amountMinor = detailData?.amountMinor || 0;

  return (
    <View style={styles.card}>
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Total Expense Amount</Text>
        <Text style={styles.amountValue}>{exportService.formatAmount(amountMinor)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.iconBox}>
          <Tag size={18} color={colors.success} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.value}>{detailData?.categoryName || 'General'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.iconBox}>
          <Calendar size={18} color={colors.success} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.label}>Transaction Date</Text>
          <Text style={styles.value}>{formatLifeItemDate(detailData?.expenseDate || item.startAt)}</Text>
        </View>
      </View>

      {(detailData?.description || item.description) && (
        <>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <FileText size={18} color={colors.success} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.label}>Description / Notes</Text>
              <Text style={styles.value}>{detailData?.description || item.description}</Text>
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
    color: colors.success,
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
    backgroundColor: colors.successLight,
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
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.default,
  },
});
