import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LifeItem, BorrowRecord } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { exportService } from '../../../services/exportService';
import { formatLifeItemDate, getRelativeDueText } from '../utils/lifeItemHelpers';
import { Handshake, User, Calendar, FileText } from 'lucide-react-native';

interface BorrowDetailProps {
  item: LifeItem;
  detailData?: BorrowRecord | null;
}

export const BorrowDetail: React.FC<BorrowDetailProps> = ({ item, detailData }) => {
  const isLent = detailData?.direction === 'lent' || item.title.toLowerCase().includes('lent');
  const amountMinor = detailData?.amountMinor;

  return (
    <View style={styles.card}>
      <View style={styles.directionBadgeRow}>
        <View style={[styles.directionBadge, isLent ? styles.lentBadge : styles.borrowedBadge]}>
          <Text style={[styles.directionText, isLent ? styles.lentText : styles.borrowedText]}>
            {isLent ? 'I LENT THIS' : 'I BORROWED THIS'}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.iconBox}>
          <User size={18} color={colors.info} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.label}>Person</Text>
          <Text style={styles.value}>{detailData?.personName || item.title.split(':')[0]}</Text>
        </View>
      </View>

      {amountMinor !== undefined && amountMinor > 0 && (
        <>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Handshake size={18} color={colors.info} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.label}>Amount</Text>
              <Text style={styles.value}>{exportService.formatAmount(amountMinor)}</Text>
            </View>
          </View>
        </>
      )}

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.iconBox}>
          <Calendar size={18} color={colors.info} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.label}>Expected Return Date</Text>
          <Text style={styles.value}>
            {formatLifeItemDate(detailData?.expectedReturnAt || item.startAt)}
          </Text>
          {(detailData?.expectedReturnAt || item.startAt) && (
            <Text style={styles.subValue}>
              {getRelativeDueText(detailData?.expectedReturnAt || item.startAt)}
            </Text>
          )}
        </View>
      </View>

      {(detailData?.notes || item.description) && (
        <>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <FileText size={18} color={colors.info} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.value}>{detailData?.notes || item.description}</Text>
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
  directionBadgeRow: {
    alignItems: 'center',
    marginBottom: spacing.default,
  },
  directionBadge: {
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.micro,
    borderRadius: radii.pill,
  },
  lentBadge: {
    backgroundColor: colors.successLight,
  },
  borrowedBadge: {
    backgroundColor: colors.warningLight,
  },
  directionText: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  lentText: {
    color: colors.success,
  },
  borrowedText: {
    color: colors.warning,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.field,
    backgroundColor: colors.infoLight,
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
    color: colors.info,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.default,
  },
});
