import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BottomSheet } from '../../../components/BottomSheet';
import { QuickAddShortcutItem } from '../../../database/repositories/quickAddRepository';
import { colors, radii, spacing, typography } from '../../../theme';
import {
  Bell,
  CheckSquare,
  IndianRupee,
  CreditCard,
  Edit3,
  ListChecks,
  HandHandshake,
  ShieldAlert,
  Zap,
  Brain,
  Plus,
} from 'lucide-react-native';

const ICON_MAP: Record<string, any> = {
  Bell,
  CheckSquare,
  IndianRupee,
  CreditCard,
  Edit3,
  ListChecks,
  HandHandshake,
  ShieldAlert,
  Zap,
  Brain,
};

interface AddShortcutBottomSheetProps {
  visible: boolean;
  availableShortcuts: QuickAddShortcutItem[];
  onClose: () => void;
  onSelectShortcut: (shortcut: QuickAddShortcutItem) => void;
}

export const AddShortcutBottomSheet: React.FC<AddShortcutBottomSheetProps> = ({
  visible,
  availableShortcuts,
  onClose,
  onSelectShortcut,
}) => {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Add Shortcut"
      icon={<Plus size={20} color="#4F46E5" style={{ marginRight: 8 }} />}
    >
      <View style={styles.container}>
        <Text style={styles.subtitleText}>
          Choose an action to add to your Quick Add bar.
        </Text>

        {availableShortcuts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>All available shortcuts have been added!</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          >
            {availableShortcuts.map((item) => {
              const IconComp = ICON_MAP[item.iconName] || Plus;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelectShortcut(item);
                    onClose();
                  }}
                >
                  <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
                    <IconComp size={20} color={item.iconColor} />
                  </View>

                  <View style={{ flex: 1, marginLeft: spacing.default }}>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    <Text style={styles.itemSubText}>Add {item.label.toLowerCase()} shortcut</Text>
                  </View>

                  <View style={styles.addPlusBadge}>
                    <Plus size={14} color="#4F46E5" strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.compact,
    paddingBottom: spacing.default,
  },
  subtitleText: {
    ...typography.caption,
    fontSize: 13,
    color: '#64748B',
    marginBottom: spacing.default,
  },
  listContainer: {
    paddingBottom: spacing.default,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.compact + 2,
    paddingHorizontal: spacing.compact,
    borderRadius: radii.card,
    backgroundColor: '#F8FAFC',
    marginBottom: spacing.small,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemSubText: {
    ...typography.caption,
    fontSize: 11,
    color: '#64748B',
  },
  addPlusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: spacing.default,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    fontSize: 13,
    color: '#64748B',
  },
});
