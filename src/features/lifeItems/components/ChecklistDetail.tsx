import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LifeItem, Checklist, ChecklistItem } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { getDB } from '../../../database/connection';
import { CheckSquare, Bell, CheckCircle2, Circle } from 'lucide-react-native';

interface ChecklistDetailProps {
  item: LifeItem;
  detailData?: Checklist | null;
  onRefresh: () => void;
}

export const ChecklistDetail: React.FC<ChecklistDetailProps> = ({ item, detailData, onRefresh }) => {
  const itemsList = detailData?.items || [];
  const completedCount = itemsList.filter((i) => i.isCompleted).length;
  const totalCount = itemsList.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggleItem = async (checkItem: ChecklistItem) => {
    try {
      const db = await getDB();
      const newStatus = checkItem.isCompleted ? 0 : 1;
      await db.executeSql(
        'UPDATE checklist_items SET is_completed = ? WHERE id = ?;',
        [newStatus, checkItem.id]
      );

      // Check if all items are completed
      const newCompletedCount = itemsList.reduce((acc, curr) => {
        if (curr.id === checkItem.id) return acc + (newStatus === 1 ? 1 : 0);
        return acc + (curr.isCompleted ? 1 : 0);
      }, 0);

      if (totalCount > 0 && newCompletedCount === totalCount) {
        await db.executeSql(
          'UPDATE life_items SET status = "completed", updated_at = ? WHERE id = ?;',
          [new Date().toISOString(), item.id]
        );
      } else if (item.status === 'completed' && newCompletedCount < totalCount) {
        await db.executeSql(
          'UPDATE life_items SET status = "pending", updated_at = ? WHERE id = ?;',
          [new Date().toISOString(), item.id]
        );
      }

      onRefresh();
    } catch (err) {
      console.error('Failed to toggle checklist item:', err);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <CheckSquare size={18} color={colors.accentTeal} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.label}>Progress</Text>
          <Text style={styles.value}>
            {completedCount} of {totalCount} completed ({progressPercent}%)
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      {detailData?.alarmEnabled && (
        <View style={styles.alarmBox}>
          <Bell size={14} color={colors.warning} />
          <Text style={styles.alarmText}>
            Checklist Alarm set for {detailData.alarmTime || '8:30 AM'}
          </Text>
        </View>
      )}

      <View style={styles.divider} />

      <Text style={styles.itemsSectionTitle}>Checklist Items</Text>

      {itemsList.length > 0 ? (
        itemsList.map((checkItem) => (
          <TouchableOpacity
            key={checkItem.id}
            style={styles.itemRow}
            onPress={() => handleToggleItem(checkItem)}
            activeOpacity={0.7}
          >
            {checkItem.isCompleted ? (
              <CheckCircle2 size={20} color={colors.success} />
            ) : (
              <Circle size={20} color={colors.textMuted} />
            )}
            <Text style={[styles.itemText, checkItem.isCompleted && styles.completedItemText]}>
              {checkItem.title}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.emptyText}>No checklist items added yet.</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radii.field,
    backgroundColor: colors.accentTealLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.default,
  },
  headerInfo: {
    flex: 1,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  value: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.compact,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accentTeal,
    borderRadius: 4,
  },
  alarmBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.compact,
    paddingVertical: spacing.micro,
    borderRadius: radii.field,
    alignSelf: 'flex-start',
    marginTop: spacing.micro,
  },
  alarmText: {
    ...typography.caption,
    color: colors.warning,
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.default,
  },
  itemsSectionTitle: {
    ...typography.title,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.compact,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.compact,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  itemText: {
    ...typography.body,
    color: colors.textPrimary,
    marginLeft: spacing.compact,
  },
  completedItemText: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  emptyText: {
    ...typography.secondary,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
