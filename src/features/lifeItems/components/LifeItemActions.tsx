import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LifeItem } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { CheckCircle2, Archive, Trash2, Clock, Edit3 } from 'lucide-react-native';

interface LifeItemActionsProps {
  item: LifeItem;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const LifeItemActions: React.FC<LifeItemActionsProps> = ({
  item,
  primaryActionLabel,
  onPrimaryAction,
  onEdit,
  onArchive,
  onDelete,
}) => {
  const handleDeletePress = () => {
    Alert.alert(
      `Delete ${item.title}?`,
      'This item and its related data will be permanently deleted. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const handleArchivePress = () => {
    Alert.alert(
      `Archive ${item.title}?`,
      'Archived items will be hidden from Home and Calendar but can be restored later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', onPress: onArchive },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {primaryActionLabel && onPrimaryAction && item.status !== 'completed' && (
        <TouchableOpacity style={styles.primaryBtn} onPress={onPrimaryAction} activeOpacity={0.85}>
          <CheckCircle2 size={20} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>{primaryActionLabel}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onEdit}>
          <Edit3 size={18} color={colors.primary} />
          <Text style={styles.secondaryBtnText}>Edit</Text>
        </TouchableOpacity>

        {item.type !== 'expense' && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleArchivePress}>
            <Archive size={18} color={colors.textSecondary} />
            <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>Archive</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.secondaryBtn, styles.deleteBtn]} onPress={handleDeletePress}>
          <Trash2 size={18} color={colors.danger} />
          <Text style={[styles.secondaryBtnText, { color: colors.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.section,
    marginBottom: spacing.default,
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.default,
    borderRadius: radii.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.default,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnText: {
    ...typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: spacing.small,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.compact,
    borderRadius: radii.field,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.small,
  },
  deleteBtn: {
    marginRight: 0,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.dangerLight,
  },
  secondaryBtnText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
});
