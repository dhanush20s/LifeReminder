import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';
import { useAppDispatch } from '../../store/hooks';
import { addBrainDump } from '../../store/slices/lifeItemSlice';
import { BottomSheet } from '../../components/BottomSheet';
import { 
  Bell, 
  CreditCard, 
  DollarSign, 
  CheckSquare, 
  Hourglass, 
  Handshake, 
  Send,
  Zap,
} from 'lucide-react-native';

interface QuickAddSheetProps {
  visible: boolean;
  onClose: () => void;
  navigation?: any;
  onSelectType?: (type: string) => void;
}

export const QuickAddSheet: React.FC<QuickAddSheetProps> = ({ visible, onClose, navigation, onSelectType }) => {
  const dispatch = useAppDispatch();
  const [brainDumpText, setBrainDumpText] = useState('');

  const handleBrainDumpSubmit = () => {
    if (!brainDumpText.trim()) return;
    dispatch(addBrainDump(brainDumpText.trim()));
    setBrainDumpText('');
    onClose();
  };

  const handleSelectOption = (type: string, route: string) => {
    onClose();
    if (onSelectType) {
      onSelectType(type);
    } else if (navigation) {
      navigation.navigate(route);
    }
  };

  const options = [
    { title: 'Reminder', type: 'reminder', icon: Bell, color: colors.primary, route: 'CreateReminder' },
    { title: 'Bill', type: 'bill', icon: CreditCard, color: colors.warning, route: 'Bills' },
    { title: 'Expense', type: 'expense', icon: DollarSign, color: colors.success, route: 'AddExpense' },
    { title: 'Checklist', type: 'checklist', icon: CheckSquare, color: colors.accentTeal, route: 'Checklists' },
    { title: 'Expiry', type: 'expiry', icon: Hourglass, color: colors.danger, route: 'Expiry' },
    { title: 'Borrow/Lend', type: 'borrow', icon: Handshake, color: colors.info, route: 'BorrowReturn' },
  ];

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="What do you want to remember?"
      icon={<Zap size={20} color="#6366F1" style={{ marginRight: 8 }} />}
    >
      <View style={styles.sheetContent}>
        {/* Shortcut Grid */}
        <View style={styles.grid}>
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <TouchableOpacity
                key={opt.title}
                style={styles.gridItem}
                onPress={() => handleSelectOption(opt.type, opt.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: `${opt.color}15` }]}>
                  <Icon size={22} color={opt.color} />
                </View>
                <Text style={styles.itemTitle}>{opt.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Brain Dump Input Box */}
        <Text style={styles.brainDumpLabel}>Or just type it into Life Inbox...</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Renew bike insurance on Sep 20"
            placeholderTextColor={colors.textMuted}
            value={brainDumpText}
            onChangeText={setBrainDumpText}
            onSubmitEditing={handleBrainDumpSubmit}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleBrainDumpSubmit} activeOpacity={0.8}>
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetContent: {
    paddingTop: spacing.compact,
    paddingBottom: spacing.default,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.default,
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: spacing.default,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.micro + 2,
  },
  itemTitle: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  brainDumpLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.small,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: radii.field,
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: spacing.small,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact + 2,
    borderRadius: radii.field,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
