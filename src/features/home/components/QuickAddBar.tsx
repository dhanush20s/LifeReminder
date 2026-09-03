import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radii, typography } from '../../../theme';
import { Bell, CheckSquare, IndianRupee, CreditCard, Edit3, Plus } from 'lucide-react-native';

interface QuickAddBarProps {
  onSelectType: (type: string) => void;
  onOpenQuickAdd: () => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onSelectType, onOpenQuickAdd }) => {
  const actions = [
    { label: 'Reminder', icon: Bell, iconColor: colors.accentPurple, bg: colors.iconBgPurple, type: 'reminder' },
    { label: 'Task', icon: CheckSquare, iconColor: colors.success, bg: colors.iconBgGreen, type: 'task' },
    { label: 'Expense', icon: IndianRupee, iconColor: colors.danger, bg: colors.iconBgRed, type: 'expense' },
    { label: 'Bill', icon: CreditCard, iconColor: colors.warning, bg: colors.iconBgAmber, type: 'bill' },
    { label: 'Note', icon: Edit3, iconColor: colors.info, bg: colors.iconBgBlue, type: 'note' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Add</Text>

      <View style={styles.cardContainer}>
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <TouchableOpacity
              key={act.label}
              style={styles.actionItem}
              onPress={() => onSelectType(act.type)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconPill, { backgroundColor: act.bg }]}>
                <Icon size={18} color={act.iconColor} />
              </View>
              <Text style={styles.actionLabel}>{act.label}</Text>
            </TouchableOpacity>
          );
        })}

        {/* More (+) Button */}
        <TouchableOpacity style={styles.actionItem} onPress={onOpenQuickAdd} activeOpacity={0.8}>
          <View style={styles.moreFab}>
            <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
          </View>
          <Text style={styles.actionLabel}>More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.default,
  },
  sectionTitle: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: spacing.compact,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingVertical: spacing.compact,
    paddingHorizontal: spacing.small,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  moreFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  actionLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
