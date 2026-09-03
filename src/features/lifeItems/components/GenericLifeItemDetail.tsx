import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LifeItem } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { formatLifeItemDateTime } from '../utils/lifeItemHelpers';
import { Calendar, FileText, Tag, Clock } from 'lucide-react-native';

interface GenericLifeItemDetailProps {
  item: LifeItem;
}

export const GenericLifeItemDetail: React.FC<GenericLifeItemDetailProps> = ({ item }) => {
  return (
    <View style={styles.card}>
      <View style={styles.infoRow}>
        <View style={styles.iconBox}>
          <Tag size={18} color={colors.primary} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{item.type.toUpperCase()}</Text>
        </View>
      </View>

      {item.startAt && (
        <>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <Calendar size={18} color={colors.primary} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.label}>Scheduled Date</Text>
              <Text style={styles.value}>{formatLifeItemDateTime(item.startAt)}</Text>
            </View>
          </View>
        </>
      )}

      {item.description && (
        <>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <FileText size={18} color={colors.primary} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.label}>Description / Notes</Text>
              <Text style={styles.value}>{item.description}</Text>
            </View>
          </View>
        </>
      )}

      <View style={styles.divider} />
      <View style={styles.infoRow}>
        <View style={styles.iconBox}>
          <Clock size={18} color={colors.primary} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.label}>Created At</Text>
          <Text style={styles.value}>{formatLifeItemDateTime(item.createdAt)}</Text>
        </View>
      </View>
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
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.default,
  },
});
