import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { LifeItem } from '../../../types/lifeItem';
import { colors, spacing, radii, typography } from '../../../theme';
import { StatusBadge } from '../../../components/StatusBadge';
import { getLifeItemTypeLabel } from '../utils/lifeItemHelpers';
import { ArrowLeft, Edit3, Bell, CreditCard, DollarSign, CheckSquare, Hourglass, Handshake, FileText } from 'lucide-react-native';

interface LifeItemDetailHeaderProps {
  item: LifeItem;
  onBack: () => void;
  onEdit: () => void;
}

export const LifeItemDetailHeader: React.FC<LifeItemDetailHeaderProps> = ({ item, onBack, onEdit }) => {
  const getIcon = () => {
    const iconSize = 24;
    switch (item.type) {
      case 'reminder': return <Bell size={iconSize} color={colors.primary} />;
      case 'bill':
      case 'subscription': return <CreditCard size={iconSize} color={colors.warning} />;
      case 'checklist': return <CheckSquare size={iconSize} color={colors.accentTeal} />;
      case 'expiry': return <Hourglass size={iconSize} color={colors.danger} />;
      case 'expense': return <DollarSign size={iconSize} color={colors.success} />;
      case 'borrow': return <Handshake size={iconSize} color={colors.info} />;
      default: return <FileText size={iconSize} color={colors.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
          <Edit3 size={18} color={colors.primary} />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroSection}>
        <View style={styles.typeIconCircle}>{getIcon()}</View>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View style={styles.badgeRow}>
          <StatusBadge status={item.status} />
          {item.priority && (
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>{item.priority.toUpperCase()} PRIORITY</Text>
            </View>
          )}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{getLifeItemTypeLabel(item.type)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.default,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 12) + 8 : spacing.default,
    paddingBottom: spacing.section,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.default,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.compact,
    paddingVertical: spacing.micro,
    borderRadius: radii.field,
  },
  editText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: spacing.small,
  },
  typeIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.compact,
  },
  itemTitle: {
    ...typography.heading,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.compact,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  priorityBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    borderRadius: radii.small,
    marginLeft: spacing.small,
  },
  priorityText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  typeBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    borderRadius: radii.small,
    marginLeft: spacing.small,
  },
  typeBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
  },
});
