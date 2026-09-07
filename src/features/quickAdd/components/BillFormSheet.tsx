import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Keyboard } from 'react-native';
import { BottomSheet } from '../../../components/BottomSheet';
import { radii, spacing, typography } from '../../../theme';
import { CreditCard, Check, Calendar } from 'lucide-react-native';
import { format } from 'date-fns';
import { DateTimePickerModal } from '../../../components/DateTimePickerModal';

interface BillFormSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    amountMinor: number;
    dueDate: string;
    description?: string;
    repeatFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }) => Promise<void>;
}

export const BillFormSheet: React.FC<BillFormSheetProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [billName, setBillName] = useState('');
  const [amountText, setAmountText] = useState('');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [repeat, setRepeat] = useState<'none' | 'monthly' | 'yearly'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const handleConfirmDate = (date: Date) => {
    setDueDate(format(date, 'yyyy-MM-dd'));
    setDatePickerVisible(false);
  };

  const handleSave = async () => {
    if (!billName.trim()) {
      setErrorMsg('Please enter a bill name');
      return;
    }
    const numericAmount = parseFloat(amountText);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Please enter a valid bill amount');
      return;
    }

    setErrorMsg('');
    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      const amountMinor = Math.round(numericAmount * 100);

      await onSubmit({
        title: billName.trim(),
        amountMinor,
        dueDate,
        repeatFrequency: repeat !== 'none' ? repeat : undefined,
      });

      setBillName('');
      setAmountText('');
      onClose();
    } catch (err) {
      console.error('Error saving bill:', err);
      setErrorMsg('Failed to save bill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Add Bill / Subscription"
      icon={<CreditCard size={20} color="#F59E0B" style={{ marginRight: 8 }} />}
    >
      <View style={styles.formContainer}>
        {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

        {/* Bill Name */}
        <Text style={styles.fieldLabel}>BILL NAME *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Netflix, Electricity, Rent, Wi-Fi"
          placeholderTextColor="#94A3B8"
          value={billName}
          onChangeText={(txt) => {
            setBillName(txt);
            if (errorMsg) setErrorMsg('');
          }}
          autoFocus
        />

        {/* Amount & Due Date */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: spacing.small }}>
            <Text style={styles.fieldLabel}>AMOUNT (₹) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              value={amountText}
              onChangeText={(txt) => {
                setAmountText(txt);
                if (errorMsg) setErrorMsg('');
              }}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>DUE DATE</Text>
            <TouchableOpacity
              style={styles.iconInputRow}
              onPress={() => setDatePickerVisible(true)}
              activeOpacity={0.7}
            >
              <Calendar size={14} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.datePickerText}>{dueDate || 'YYYY-MM-DD'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={() => setDatePickerVisible(false)}
        />

        {/* Recurrence */}
        <Text style={styles.fieldLabel}>REPEAT RECURRENCE</Text>
        <View style={styles.pillGroup}>
          {(['none', 'monthly', 'yearly'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.pill, repeat === r && styles.activePill]}
              onPress={() => setRepeat(r)}
            >
              <Text style={[styles.pillText, repeat === r && styles.activePillText]}>
                {r === 'none' ? 'ONE TIME' : r.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Action */}
        <TouchableOpacity
          style={[styles.saveBtn, isSubmitting && styles.disabledBtn]}
          onPress={handleSave}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
          ) : (
            <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          )}
          <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Save Bill'}</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    paddingTop: spacing.compact,
    paddingBottom: spacing.default,
  },
  errorBanner: {
    ...typography.caption,
    fontSize: 12,
    color: '#EF4444',
    marginBottom: spacing.small,
    fontWeight: '600',
  },
  fieldLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.field,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing.default,
    paddingVertical: spacing.compact,
    ...typography.body,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: spacing.default,
  },
  row: {
    flexDirection: 'row',
  },
  iconInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radii.field,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: spacing.compact + 2,
    paddingVertical: spacing.compact + 2,
    marginBottom: spacing.default,
  },
  datePickerText: {
    ...typography.body,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  pillGroup: {
    flexDirection: 'row',
    marginBottom: spacing.default,
  },
  pill: {
    flex: 1,
    paddingVertical: spacing.compact,
    alignItems: 'center',
    borderRadius: radii.pill,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  activePill: {
    backgroundColor: '#F59E0B',
  },
  pillText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  activePillText: {
    color: '#FFFFFF',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: spacing.compact + 4,
    borderRadius: radii.pill,
    marginTop: spacing.compact,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    ...typography.caption,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabledBtn: {
    opacity: 0.7,
  },
});
