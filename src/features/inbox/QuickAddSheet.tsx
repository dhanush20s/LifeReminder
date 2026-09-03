import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';
import { useAppDispatch } from '../../store/hooks';
import { addBrainDump } from '../../store/slices/lifeItemSlice';
import { 
  Bell, 
  CreditCard, 
  DollarSign, 
  CheckSquare, 
  Hourglass, 
  Handshake, 
  MapPin, 
  FileText, 
  X,
  Send
} from 'lucide-react-native';

interface QuickAddSheetProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

export const QuickAddSheet: React.FC<QuickAddSheetProps> = ({ visible, onClose, navigation }) => {
  const dispatch = useAppDispatch();
  const [brainDumpText, setBrainDumpText] = useState('');

  const handleBrainDumpSubmit = () => {
    if (!brainDumpText.trim()) return;
    dispatch(addBrainDump(brainDumpText.trim()));
    setBrainDumpText('');
    onClose();
  };

  const handleSelectOption = (route: string) => {
    onClose();
    navigation.navigate(route);
  };

  const options = [
    { title: 'Reminder', icon: Bell, color: colors.primary, route: 'CreateReminder' },
    { title: 'Bill', icon: CreditCard, color: colors.warning, route: 'CreateBill' },
    { title: 'Expense', icon: DollarSign, color: colors.success, route: 'AddExpense' },
    { title: 'Checklist', icon: CheckSquare, color: colors.accentTeal, route: 'Checklists' },
    { title: 'Expiry', icon: Hourglass, color: colors.danger, route: 'Expiry' },
    { title: 'Borrow/Lend', icon: Handshake, color: colors.info, route: 'BorrowReturn' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>What do you want to remember?</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Shortcut Grid */}
          <View style={styles.grid}>
            {options.map((opt) => {
              const Icon = opt.icon;
              return (
                <TouchableOpacity
                  key={opt.title}
                  style={styles.gridItem}
                  onPress={() => handleSelectOption(opt.route)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: `${opt.color}15` }]}>
                    <Icon size={24} color={opt.color} />
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
            <TouchableOpacity style={styles.sendButton} onPress={handleBrainDumpSubmit}>
              <Send size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    padding: spacing.default,
    paddingBottom: spacing.section,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.section,
  },
  sheetTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.section,
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
    marginBottom: spacing.micro,
  },
  itemTitle: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  brainDumpLabel: {
    ...typography.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.small,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radii.field,
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.small,
  },
  sendButton: {
    backgroundColor: colors.primary,
    padding: spacing.compact,
    borderRadius: radii.field,
  },
});
