import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LifeItem, ExpiryRecord } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { formatLifeItemDate, getDaysRemaining } from '../utils/lifeItemHelpers';
import { Hourglass, Calendar, AlertTriangle, FileText } from 'lucide-react-native';

interface ExpiryDetailProps {
  item: LifeItem;
  detailData?: ExpiryRecord | null;
}

export const ExpiryDetail: React.FC<ExpiryDetailProps> = ({ item, detailData }) => {
  const expiryDateStr = detailData?.expiryDate || item.startAt;
  const daysLeft = getDaysRemaining(expiryDateStr);

  let statusText = 'Valid';
  let statusColor = colors.success;

  if (daysLeft !== null) {
    if (daysLeft < 0) {
      statusText = `Expired ${Math.abs(daysLeft)} days ago`;
      statusColor = colors.danger;
    } else if (daysLeft <= 7) {
      statusText = `Expiring in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`;
      statusColor = colors.warning;
    } else {
      statusText = `${daysLeft} days remaining`;
      statusColor = colors.success;
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.infoRow}>
        <View style={styles.iconBox}>
          <Hourglass size={18} color={colors.danger} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.label}>Expiry Status</Text>
          <Text style={[styles.value, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.iconBox}>
          <Calendar size={18} color={colors.danger} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.label}>Expiration Date</Text>
          <Text style={styles.value}>{formatLifeItemDate(expiryDateStr)}</Text>
        </View>
      </View>

      {item.description && (
        <>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <FileText size={18} color={colors.danger} />
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
    backgroundColor: colors.dangerLight,
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
