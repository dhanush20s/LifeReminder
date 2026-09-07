import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheet } from '../../../components/BottomSheet';
import { colors, radii, spacing, typography } from '../../../theme';
import {
  ListChecks,
  Hourglass,
  Handshake,
  Package,
  MapPin,
  Brain,
  Calendar,
  Grid,
} from 'lucide-react-native';

export type MoreActionType =
  | 'checklist'
  | 'expiry'
  | 'borrow'
  | 'inventory'
  | 'parking'
  | 'inbox'
  | 'event';

interface MoreActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectAction: (type: MoreActionType) => void;
}

export const MoreActionsSheet: React.FC<MoreActionsSheetProps> = ({
  visible,
  onClose,
  onSelectAction,
}) => {
  const actions = [
    { type: 'checklist' as MoreActionType, label: 'Checklist', icon: ListChecks, color: '#8B5CF6', bg: '#F5F3FF' },
    { type: 'expiry' as MoreActionType, label: 'Expiry', icon: Hourglass, color: '#EF4444', bg: '#FEF2F2' },
    { type: 'borrow' as MoreActionType, label: 'Borrow / Lend', icon: Handshake, color: '#EC4899', bg: '#FDF2F8' },
    { type: 'inventory' as MoreActionType, label: 'Inventory', icon: Package, color: '#06B6D4', bg: '#ECFEFF' },
    { type: 'parking' as MoreActionType, label: 'Parking', icon: MapPin, color: '#F59E0B', bg: '#FFFBEB' },
    { type: 'inbox' as MoreActionType, label: 'Brain Dump', icon: Brain, color: '#64748B', bg: '#F1F5F9' },
    { type: 'event' as MoreActionType, label: 'Event / Follow-up', icon: Calendar, color: '#10B981', bg: '#ECFDF5' },
  ];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="MORE ACTIONS"
      icon={<Grid size={18} color="#6366F1" style={{ marginRight: 6 }} />}
    >
      <View style={styles.content}>
        <View style={styles.grid}>
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <TouchableOpacity
                key={act.type}
                style={styles.gridCard}
                onPress={() => {
                  onClose();
                  onSelectAction(act.type);
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.iconCircle, { backgroundColor: act.bg }]}>
                  <Icon size={22} color={act.color} />
                </View>
                <Text style={styles.cardLabel}>{act.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.compact,
    paddingBottom: spacing.default,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.card,
    padding: spacing.compact + 2,
    marginBottom: spacing.compact,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.small,
  },
  cardLabel: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
});
